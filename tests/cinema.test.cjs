const test=require('node:test'),assert=require('node:assert/strict');
const {chapter}=require('../dist/cinema.js');
test('story follows revealed messages without showing a future successful outcome',()=>{
 assert.equal(chapter([],false,'CONSENSUS'),0);
 const first={type:'PROPOSE',round:1};
 assert.equal(chapter([first],false,'CONSENSUS'),1);
 assert.equal(chapter([first,{type:'REJECT'}],false,'CONSENSUS'),2);
 assert.equal(chapter([first,{type:'REJECT'},{type:'PROPOSE',round:2}],false,'CONSENSUS'),3);
 assert.equal(chapter([],true,'CONSENSUS'),4);
 assert.equal(chapter([],true,'FALLBACK'),4);
 assert.equal(chapter([],true,'ESCALATE'),5);
 assert.equal(chapter([],true,'NOT_EVALUATED'),5);
});
