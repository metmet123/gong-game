(function(root){'use strict';const node=typeof module!=='undefined'&&module.exports,E=node?require('./review.js'):root.WelfareEngine;
 function record(c,s){return {caseId:c.id,contentVersion:1,resolutionId:c.id+':handoff',outcome:'handoff-complete',serviceApproved:false,snapshot:{options:E.clone(s.options),knowledge:E.clone(s.knowledge),draft:E.clone(s.draft)},itemId:c.itemId};}
 function resolve(c,s,r){if(s.status!=='editing'||!r||r.fingerprint!==E.fingerprint(s)||r.status!=='ready'||E.review(c,s).status!=='ready')return {accepted:false,state:s,issues:[{code:'review-expired',message:'최신 초안을 다시 검토해 주세요.'}]};const n=E.clone(s);n.status='resolved';n.record=record(c,s);n.review=E.review(c,s);n.revision++;return {accepted:true,state:n,record:n.record,issues:[]};}
 Object.assign(E,{record,resolve});if(node)module.exports=E;
})(globalThis);
