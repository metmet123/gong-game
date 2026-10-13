"""Check editorial scope, document parity and isolated HTML payload."""
import hashlib
import json
import runpy
from collections import Counter
from pathlib import Path
from revise import HERE, ROOT, leaves

if (HERE / 'character-expansion/before_data.json').exists():
    runpy.run_path(str(HERE / 'validate-expansion.py'), run_name='__main__')
    raise SystemExit(0)

before = json.loads((HERE / 'before_data.json').read_text(encoding='utf-8'))
after = json.loads((ROOT / 'docs/narrative/narrative_data.json').read_text(encoding='utf-8'))
old_leaves, new_leaves = dict(leaves(before)), dict(leaves(after))
assert old_leaves.keys() == new_leaves.keys(), 'Schema/array shape changed'
changes = []
for path, old in old_leaves.items():
    new = new_leaves[path]
    assert type(old) is type(new), path
    if old != new:
        assert isinstance(old, str) and isinstance(new, str), path
        assert path[-1] not in {'id', 'who', 'spot', 'unlock', 'condition', 'note'} or path == ('achievements', 12, 'condition'), path
        assert path[0] != 'proposals', path
        assert new.strip() and '\ufffd' not in new and not any(c in new for c in ['<script', '</script']), path
        changes.append({'path': list(path), 'before': old, 'after': new})
assert changes == json.loads((HERE / 'changes.json').read_text(encoding='utf-8'))
assert list(after['days']) == [str(i) for i in range(1, 16)]
assert [d for d, v in after['days'].items() if v['actTransition']] == ['6', '12', '15']
assert len(after['characters']) == 12
assert sum(len(v['rel']) for v in after['characters'].values()) == 36
assert all(len(scene) == 4 for v in after['characters'].values() for scene in v['rel'].values())
assert sum(len(v['visits']) for v in after['visitors'].values()) == 8
assert len(after['results']) == 21 and len(after['dex']['tasks']) == 24
assert len(after['departments']) == 11 and len(after['decor']) == 29
assert len(after['achievements']) == 22 and len(after['endings']) == 4
for key in after['visitors']:
    assert after['visitors'][key]['profile'] == after['characters'][key]['profile']
for key, v in after['departments'].items():
    assert v['keepsake']['desc'] == after['decor'][key + '_token']['dex']
for v in after['results'].values():
    assert v['assisted'] == v['good'] + ' 해법을 참고해 마쳤어요.'

md = (ROOT / 'docs/narrative/narrative_concept.md').read_text(encoding='utf-8')
assert all(v['after'] in md for v in changes), 'Revised data missing from prose handbook'
assert not any(v['before'] in md for v in changes if len(v['before']) > 10 and not any(v['before'] in text for text in new_leaves.values() if isinstance(text,str))), 'Obsolete long sentence remains in handbook'
upstream = (HERE / 'upstream/index.html').read_text(encoding='utf-8')
candidate = (HERE / 'candidate/index.html').read_text(encoding='utf-8')
def split_payload(s):
    start = s.index('const Narrative=') + len('const Narrative=')
    payload, length = json.JSONDecoder().raw_decode(s[start:])
    return s[:start], payload, s[start+length:]
old_prefix, original_payload, old_suffix = split_payload(upstream)
new_prefix, revised_payload, new_suffix = split_payload(candidate)
assert original_payload == before and revised_payload == after
expected = old_prefix + json.dumps(after, ensure_ascii=False, separators=(',', ':')) + old_suffix
patches = json.loads((HERE / 'context-review/html-patches.json').read_text(encoding='utf-8'))
for patch in patches:
    assert expected.count(patch['before']) == patch['count'], patch
    expected = expected.replace(patch['before'], patch['after'])
assert expected == candidate, 'Unexpected code/UI/storage change'
text_values = [(p, v) for p, v in new_leaves.items() if isinstance(v, str) and any('\uac00' <= c <= '\ud7a3' for c in v)]
display = [(p, v) for p, v in text_values if p[0] != 'proposals' and p[-1] not in {'condition', 'note', 'hook'}]
report = {
    'status': 'PASS',
    'changedTextFields': len(changes),
    'changedBySection': dict(Counter(v['path'][0] for v in changes)),
    'scannedKoreanTextFields': len(text_values),
    'displayTextFields': len(display),
    'maxDisplayCharacters': max(len(v) for _, v in display),
    'longestDisplayFields': [{'path': list(p), 'length': len(v), 'text': v} for p, v in sorted(display, key=lambda x: len(x[1]), reverse=True)[:10]],
    'checks': ['same keys/types/array lengths', 'speaker/ID/unlock/note/proposals preserved; decor18 condition documentation corrected to existing predicate',
               '15 days/3 act transitions/12 characters/36 relationship scenes/8 visits preserved',
               'duplicate visitor profiles and keepsake descriptions synchronized',
               'assisted completion has identical consequence', 'prose handbook contains all revised strings',
               'upstream embedded narrative matches baseline', 'outside narrative only explicit html-patches manifest changed; gameplay/storage predicates unchanged'],
    'upstreamBlobSha': '46a89e50e3bc67d19db80ea7b154c9013afb7150',
    'upstreamSnapshotSha256': hashlib.sha256(upstream.encode('utf-8')).hexdigest(),
    'candidateSha256': hashlib.sha256(candidate.encode('utf-8')).hexdigest(),
    'notVerified': ['actual mobile text wrapping', 'all-game playthrough', 'public deployment'],
}
(HERE / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({k: report[k] for k in ['status', 'changedTextFields', 'changedBySection', 'scannedKoreanTextFields', 'maxDisplayCharacters']}, ensure_ascii=False))
