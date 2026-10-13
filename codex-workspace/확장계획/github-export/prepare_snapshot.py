from pathlib import Path
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[2]
REPO = ROOT / '.github-publish'
EXPORT = ROOT / '확장계획' / 'github-export'
DEST = REPO / 'codex-workspace'
CHAT_DEST = REPO / 'codex-chats'
EXCLUDED = {'.github-publish', '.git', '__pycache__', 'node_modules'}
THREADS = [
 ('공무원키우기 확장 계획', '01a12949-aff1-7b61-afe1-8c45824dc086', '전체 기획·공통 규격·루트 자료', '확장계획/'),
 ('공무원키우기 확장_주민센터', '01a12957-3ffa-7611-b85e-2b2e35154255', '전입·복지상담 독립 게임과 검증', '주민센터/'),
 ('공무원키우기 확장_생활보장과', '01a1295c-09a6-7c22-8a96-00670fb52620', '공문 퍼즐 A와 기존 E01', '생활보장과/'),
 ('공무원키우기 확장_생활보장과_스토리', '01a12960-4b49-7170-a8db-170969893e11', '공통 대본·캐릭터·신문·도감 검수와 배포 기록', '확장계획/narrative-review/'),
 ('공무원키우기 확장_교통행정과', '01a12957-2457-7573-9fc8-bf92da3fb28b', '민원봉사과 챕터 계획·교통 확장 구상', '교통행정과/'),
]

def owner(path):
 if path.startswith(('docs/narrative/', '확장계획/narrative-review/')): return THREADS[3][0]
 if path.startswith(('주민센터/',)): return THREADS[1][0]
 if path.startswith(('생활보장과/', 'docs/episodes/')): return THREADS[2][0]
 if path.startswith(('교통행정과/', 'docs/chapters/civil_service/')): return THREADS[4][0]
 if path.startswith('shared/'): return '공통 운영·전달 기록'
 if path.startswith('.codex-remote-attachments/'): return '사용자 첨부 자료'
 return THREADS[0][0]

def digest(data): return hashlib.sha256(data).hexdigest()

def dump(path, value):
 path.parent.mkdir(parents=True, exist_ok=True)
 path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def main():
 assert (REPO / '.git').is_dir(), 'Upload checkout not found'
 entries, excluded = [], []
 for source in sorted(ROOT.rglob('*')):
  rel = source.relative_to(ROOT)
  if any(p in EXCLUDED for p in rel.parts) or not source.is_file(): continue
  path = rel.as_posix()
  if source.suffix == '.pyc':
   excluded.append(path)
   continue
  data = source.read_bytes()
  target = DEST / rel
  target.parent.mkdir(parents=True, exist_ok=True)
  target.write_bytes(data)
  assert digest(target.read_bytes()) == digest(data), path
  entries.append({'path': path, 'repositoryPath': 'codex-workspace/'+path, 'bytes': len(data), 'sha256': digest(data), 'owner': owner(path)})

 for title, thread_id, description, primary in THREADS:
  folder = CHAT_DEST / title
  folder.mkdir(parents=True, exist_ok=True)
  shutil.copyfile(EXPORT / '채팅별' / title / '작업대화.md', folder / '작업대화.md')
  selected = [e for e in entries if e['owner'] == title and not e['path'].startswith('확장계획/github-export/')]
  dump(folder / '파일목록.json', selected)
  text = '# '+title+'\n\n- 채팅 ID: `'+thread_id+'`\n- 역할: '+description+'\n- 자료 기준: 2026-10-13 작업 폴더 스냅샷\n- 실제 파일은 원래 경로와 상대 링크를 보존한 `codex-workspace/`에 있습니다. 이 폴더는 채팅별 보관 색인이며 두 번째 개발 원본이 아닙니다.\n- 채팅의 요청·답변은 [작업대화](작업대화.md), 담당 파일과 SHA-256은 [파일목록](파일목록.json)을 참고합니다. 파일 담당은 shared/OWNERS와 실제 작업 기록을 기준으로 분류했습니다.\n\n'
  text += '[주요 작업 폴더](../../codex-workspace/'+primary+')\n\n'
  if title == THREADS[3][0]: text += '[최신 대본](../../codex-workspace/docs/narrative/) · [검수·배포 작업 로그](../../codex-workspace/확장계획/2._WORK_LOG.md)\n\n스토리 채팅의 실제 산출물은 공통 대본과 검수 폴더에 저장되어 있습니다. 분류를 위해 원본을 이동하지 않았습니다.\n'
  if title == THREADS[2][0]: text += '[기존 E01 기록](../../codex-workspace/docs/episodes/)\n'
  if title == THREADS[4][0]: text += '[민원봉사과 상세 계획](../../codex-workspace/docs/chapters/civil_service/)\n'
  (folder/'README.md').write_text(text, encoding='utf-8')

 manifest = {'date':'2026-10-13 KST', 'repository':'metmet123/gong-game', 'branch':'gong-game-codex', 'files':entries, 'excludedCaches':excluded, 'fileCount':len(entries), 'totalBytes':sum(e['bytes'] for e in entries), 'validation':'All snapshot copies match their source SHA-256.'}
 dump(REPO/'codex-chats'/'workspace-manifest.json', manifest)
 index = '# Codex 전체 작업 보관\n\n2026-10-13 · `gong-game-codex` 브랜치\n\n[전체 작업 폴더](codex-workspace/) · [파일 해시와 보관 검증](codex-chats/workspace-manifest.json)\n\n기존 원격 main 파일을 바탕으로 추가 보관했습니다. 기존 사이트 게임 파일은 변경하지 않았으며 이 브랜치 보관은 본편 통합이나 Pages 배포 완료를 뜻하지 않습니다.\n\n| 채팅 | 자료 |\n|---|---|\n'
 for title, _, description, _ in THREADS:
  index += '| ['+title+'](codex-chats/'+title+'/README.md) | '+description+' |\n'
 index += '\n전체 소스·계획·작업 로그·테스트·시안·이미지·조사·검증 자료와 사용자 첨부를 포함합니다. 업로드용 Git 사본 및 실행 캐시는 제외합니다. 채팅 기록은 읽기 도구의 모든 페이지에서 사용자 요청과 공개 답변·진행 안내를 모았습니다. 내부 추론 및 도구 원문은 포함하지 않습니다.\n'
 (REPO/'CODEX_WORKSPACE.md').write_text(index, encoding='utf-8')
 print(json.dumps({'files':len(entries),'bytes':manifest['totalBytes'],'chatFolders':len(THREADS),'copyHashes':'PASS'}, ensure_ascii=True))

if __name__ == '__main__': main()
