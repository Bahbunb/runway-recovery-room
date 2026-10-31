'use strict';
(()=>{
 const rail=document.querySelector('.coordination-orbit'),toggle=document.querySelector('#motionToggle');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,lastMessage='',lastStory='',lastStatus='';
 try{paused=localStorage.getItem('aerolink-motion')==='paused';}catch{}
 const allowed=()=>!paused&&!reduced.matches;
 function syncToggle(){document.body.classList.toggle('motion-paused',paused||reduced.matches);toggle.setAttribute('aria-pressed',String(paused||reduced.matches));toggle.textContent=paused||reduced.matches?'Motion paused':'Pause motion';}
 toggle.onclick=()=>{paused=!paused;try{localStorage.setItem('aerolink-motion',paused?'paused':'on');}catch{}syncToggle();update();};
 reduced.addEventListener('change',()=>{syncToggle();update();});
 function reveal(node){if(node&&allowed())node.animate([{opacity:.25,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'cubic-bezier(.2,.7,.2,1)'});}
 function update(){
  const message=document.querySelector('#messageBus'),story=document.querySelector('#flightStory'),status=document.querySelector('#kpiStatus').textContent;
  const playing=document.querySelector('#playBtn').textContent.includes('Pause');
  const live=status==='Live negotiation',busy=status==='Evaluating';
  rail.classList.toggle('is-coordinating',allowed()&&(playing||live||busy));
  rail.classList.toggle('is-agreed',status==='CONSENSUS');
  const captionText=live?'Live agent responses · shared proposal exchange':busy?'Evaluating candidate plans against operational constraints':playing?'Recorded message playback · visualising the shared plan exchange':status==='CONSENSUS'?'Agreement verified · all three domains accepted the same plan':status==='Not started'?'Ready for a shared proposal · visualisation follows message playback':'Playback paused or complete · inspect the checks and recorded messages';
  const caption=document.querySelector('#networkCaption');if(caption.textContent!==captionText)caption.textContent=captionText;
  const msg=message.textContent;if(msg!==lastMessage){reveal(message.lastElementChild);lastMessage=msg;}
  const text=story.textContent;if(text!==lastStory){if(!story.hidden)reveal(story.querySelector('.flight-confirmation:last-child')||story);lastStory=text;}
  if(status!==lastStatus){if(status==='CONSENSUS')reveal(document.querySelector('#planSummary'));lastStatus=status;}
 }
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;update();});}}).observe(document.querySelector('.main'),{childList:true,subtree:true});
 syncToggle();update();
})();
