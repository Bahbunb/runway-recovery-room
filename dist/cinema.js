(function(root){'use strict';
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chapter(messages,done,status){
 const latest=[...messages].reverse().find(m=>m.type==='PROPOSE');
 if(done)return status==='CONSENSUS'?4:status==='FALLBACK'?4:5;
 if(latest?.round>1)return 3;
 if(messages.some(m=>['REJECT','ERROR'].includes(m.type)))return 2;
 return messages.length?1:0;
}
function draw({s,v,result,stage,runId,playing}){
 const panel=document.querySelector('#recoveryCinema');if(!panel)return;
 const phase=chapter(v.messages,v.done,result?.status),last=v.messages.at(-1),proposal=[...v.messages].reverse().find(m=>m.type==='PROPOSE');
 const titles=['A disruption. A shared challenge.','One proposal. Three perspectives.','A conflict comes into focus.','A better plan takes shape.','A validated path forward.','No shortcut around safety.'];
 const descriptions=[s.disruption?.description||'Configure your disruption, then start recovery.', 'ATC, Pilot and Ground check the same proposal against their own operational constraints.',[...v.messages].reverse().find(m=>['REJECT','ERROR'].includes(m.type))?.reason||'A domain has rejected this proposal. The schedule needs to change before it can be committed.','The revised proposal returns to all three domains. Earlier approvals do not carry over.',result?.status==='FALLBACK'?'The deterministic fallback found a plan that passes all hard constraints. This is a fallback result, not agent consensus.':'Every domain accepted the same plan version. Flight confirmations can now appear in landing order.','No plan was committed. Review failed checks and missing inputs; safety margins remain protected.'];
 const signature=runId+'|'+phase+'|'+(last?.proposal_id||'')+'|'+(last?.sender||'')+'|'+(last?.type||'');
 if(panel.dataset.signature!==signature){if(panel.dataset.phase!==String(phase)&&!document.body.classList.contains('motion-paused')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)panel.querySelector('.cinema-heading').animate([{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'ease-out'});panel.dataset.signature=signature;panel.dataset.phase=phase;panel.querySelector('.cinema-title').textContent=titles[phase];panel.querySelector('.cinema-copy').textContent=descriptions[phase];panel.querySelector('.cinema-chapter').textContent=phase===5?'RECOVERY BLOCKED':'CHAPTER '+String(Math.min(phase+1,5)).padStart(2,'0')+' / 05';panel.querySelector('.cinema-caption').textContent=runId?(result?.mode==='claude'?'Local agent run · conceptual plan animation':'Rules simulation · conceptual plan animation'):'Configure a scenario · no live aircraft tracking';}
 panel.classList.toggle('cinema-playing',!!playing);
 const steps=panel.querySelectorAll('.chapter-step');steps.forEach((node,i)=>{node.classList.toggle('current',i===Math.min(phase,4));node.classList.toggle('complete',i<phase);});
 const messages=proposal?v.messages.filter(m=>m.proposal_id===proposal.proposal.id):[];
 for(const role of ['atc','pilot','ground']){const vote=[...messages].reverse().find(m=>m.sender===role&&['ACCEPT','REJECT','ERROR'].includes(m.type));const node=panel.querySelector('[data-cinema-role="'+role+'"]');node.dataset.vote=vote?.type||'WAIT';node.querySelector('b').textContent=vote?.type==='ACCEPT'?'✓':vote?.type==='REJECT'?'!':vote?.type==='ERROR'?'×':'·';}
 const sky=panel.querySelector('.cinema-aircraft');const identity=runId+'|'+s.flights.map(f=>f.id+f.callsign).join('|');
 if(sky.dataset.identity!==identity){sky.dataset.identity=identity;sky.innerHTML=s.flights.map((f,i)=>'<div class="story-plane" data-flight="'+escape(f.id)+'" style="--lane:'+i+'"><span class="plane-glyph">✈</span><span class="plane-call">'+escape(f.callsign)+'</span><span class="plane-destination">Awaiting plan</span></div>').join('');sky.style.setProperty('--lanes',s.flights.length);}
 const accepted=v.done&&['CONSENSUS','FALLBACK'].includes(result?.status)&&result?.plan;
 for(const [i,f] of s.flights.entries()){const node=[...sky.children].find(n=>n.dataset.flight===f.id),event=accepted?stage.events.find(e=>e.flight===f.id):null;const index=event?stage.events.indexOf(event):-1;const confirmed=!!event&&index<stage.confirmed;
 node.classList.toggle('plane-cleared',confirmed);node.classList.toggle('plane-diverted',confirmed&&event.action==='divert');const label=node.querySelector('.plane-destination');const text=confirmed?(event.action==='divert'?'→ Alternate '+event.alternate:'→ '+event.stand+' · T+'+event.on_stand):event?'Validated · queued':phase===5?'No clearance':'Awaiting plan';if(label.textContent!==text)label.textContent=text;
 }
 const note=panel.querySelector('.cinema-outcome');const text=accepted?stage.confirmed+' / '+stage.events.length+' simulated flight confirmations':phase===5?'No flights cleared · inspect the blockers':proposal?'Turn '+proposal.round+' · approvals apply only to this proposal':'Start recovery to see the story unfold';if(note.textContent!==text)note.textContent=text;
}
root.RecoveryCinema={draw,chapter};if(typeof module!=='undefined')module.exports={chapter};
})(typeof window!=='undefined'?window:globalThis);
