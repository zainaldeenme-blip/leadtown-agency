'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, sound = false, audio, stage = 0;
  const stageData = [
    ['THE RIGHT FIRST IMPRESSION', 'Turn a scroll<br>into a second look.', 'Meta campaigns and a considered Instagram presence give people a reason to stop. Clear creative. Relevant messages. A destination worth visiting.', ['Meta ads', 'Instagram', 'Creative direction'], 'Let’s get you noticed', 'Meta ads'],
    ['A PLACE THAT FEELS LIKE YOU', 'Give interest<br>somewhere to go.', 'A distinctive website does more than look good. It explains your business, answers the right questions and gives someone a clear reason to get in touch.', ['Websites', 'Landing pages', 'Quote journeys'], 'Let’s build your presence', 'Website or landing page'],
    ['NO MORE LOOSE ENDS', 'A conversation.<br>Not a dead end.', 'Connect the enquiry to your team and a follow-up process. Keep the next action visible, so an interested person has a clearer path towards becoming a customer.', ['CRM & lead tracking', 'Lead handover', 'Follow-up'], 'Let’s connect the pieces', 'CRM & lead tracking']
  ];
  function tone() {
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume().catch(() => {});
      const oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime([392,494,587][stage],now);
      gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.035,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+.28);
      oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.3);
    } catch { sound=false; updateSound(); }
  }
  function setStage(index) {
    stage=index;const d=stageData[index];
    $$('.stage, .scene-label').forEach(el=>{const on=Number(el.dataset.stage)===index;el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));});
    $('#system').dataset.active=String(index);$('#stage-kicker').textContent=d[0];$('#stage-heading').innerHTML=d[1];$('#stage-copy').textContent=d[2];
    $('#stage-chips').replaceChildren(...d[3].map(t=>{const span=document.createElement('span');span.textContent=t;return span;}));
    $('#stage-cta').innerHTML=d[4]+' <span aria-hidden="true">↗</span>';$('#stage-cta').dataset.service=d[5];
    $('#scene-hint').textContent=['Ads & social — attention starts here.','Websites — turn interest into an enquiry.','Follow-up — give every enquiry a next step.'][index];document.dispatchEvent(new CustomEvent('district-stage',{detail:index}));tone();
  }
  $$('.stage, .scene-label').forEach(el=>el.addEventListener('click',()=>setStage(Number(el.dataset.stage))));
  document.addEventListener('district-select',e=>setStage(e.detail));
  $('#scene-reset').addEventListener('click',()=>{document.dispatchEvent(new CustomEvent('district-reset'));$('#scene-hint').textContent='Move to look around. Select a building to move closer.';});
  $$('.service-row').forEach(row=>row.addEventListener('toggle',()=>{
    if(!row.open)return;
    $$('.service-row').forEach(other=>{if(other!==row)other.open=false;});
    requestAnimationFrame(()=>{if(row.getBoundingClientRect().top<110)row.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});});
  }));
  function updateMotion() {$('#motion-toggle').setAttribute('aria-pressed',String(paused));$('#motion-toggle').setAttribute('aria-label',paused?'Resume scene motion':'Pause scene motion');$('#motion-toggle').title=paused?'Resume scene motion':'Pause scene motion';$('#motion-toggle').textContent=paused?'▷':'Ⅱ';document.body.classList.toggle('motion-paused',paused);document.dispatchEvent(new CustomEvent('district-motion',{detail:paused}));}
  $('#motion-toggle').addEventListener('click',()=>{paused=!paused;updateMotion();});
  reduced.addEventListener('change',e=>{paused=e.matches;updateMotion();});
  function updateSound() {$('#sound-toggle').setAttribute('aria-pressed',String(sound));$('#sound-toggle').setAttribute('aria-label',sound?'Disable sound':'Enable sound');$('#sound-toggle').title=sound?'Disable sound':'Enable sound';}
  $('#sound-toggle').addEventListener('click',()=>{sound=!sound;updateSound();tone();});
  updateMotion();updateSound();
  const mobile=$('#mobile-nav'),menu=$('.menu-toggle');
  function closeMenu(){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
  menu.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;menu.setAttribute('aria-expanded',String(!mobile.hidden));menu.setAttribute('aria-label',mobile.hidden?'Open navigation':'Close navigation');});
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const dialog=$('#quote-dialog'),form=$('#quote-form');let step=0,opener=null,brief='';
  function selected(){return $$('input[name=service]:checked').map(x=>x.value);}
  function showStep(n){step=n;$$('.quote-step').forEach(el=>el.hidden=Number(el.dataset.step)!==n);$$('.quote-progress span').forEach((el,i)=>el.classList.toggle('active',i<=n));$('#quote-back').hidden=n===0;$('#quote-next').hidden=n===2;$('#step-count').textContent=`0${n+1} / 03`;$('#form-error').textContent='';if(n===2)buildBrief();dialog.scrollTop=0;const target=n===1?form.elements.name:n===2?$('#quote-consent'):$('.service-options input');target?.focus({preventScroll:true});}
  function buildBrief(){const d=new FormData(form);brief=`Hi LeadTown, I’d like a free custom quote.\n\nServices: ${selected().join(', ')}\nName: ${d.get('name')}\nBusiness: ${d.get('business')}\nEmail: ${d.get('email')}\nWebsite / Instagram: ${d.get('website')||'Not supplied'}\n\nWhat I’d like to change:\n${d.get('goal')}\n\nIdeal timing: ${d.get('timing')}\nProject budget (NZD): ${d.get('budget')}\n\nPlease contact me to discuss the scope and a written quote.`;$('#brief-preview').textContent=brief;$('#quote-consent').checked=false;$('#copy-status').textContent='';updateSend();}
  function updateSend(){const a=$('#whatsapp-send');const consent=$('#quote-consent').checked;a.setAttribute('aria-disabled',String(!consent));if(consent)a.href='https://wa.me/64223905211?text='+encodeURIComponent(brief);else a.removeAttribute('href');}
  $$('.quote-trigger').forEach(button=>button.addEventListener('click',()=>{opener=button;const val=button.dataset.service;if(val)$$('input[name=service]').forEach(input=>input.checked=input.value===val);closeMenu();dialog.showModal();document.body.classList.add('quote-open');showStep(0);}));
  function closeDialog(){dialog.close();}
  $('.close-dialog').addEventListener('click',closeDialog);
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('quote-open');opener?.focus({preventScroll:true});});
  $('#quote-next').addEventListener('click',()=>{if(step===0){if(!selected().length){$('#form-error').textContent='Choose at least one starting point, or select “Help me decide”.';$('.service-options input').focus();return;}showStep(1);}else if(step===1){const fields=$$('.quote-step[data-step="1"] input, .quote-step[data-step="1"] textarea');for(const field of fields){if(field.required&&!field.value.trim()){field.setCustomValidity('Please fill out this field.');}else field.setCustomValidity('');if(!field.reportValidity())return;}showStep(2);}});
  $$('input,textarea').forEach(el=>el.addEventListener('input',()=>el.setCustomValidity('')));
  $('#quote-back').addEventListener('click',()=>showStep(Math.max(0,step-1)));
  form.addEventListener('submit',e=>e.preventDefault());
  $('#quote-consent').addEventListener('change',updateSend);
  $('#whatsapp-send').addEventListener('click',e=>{if(!$('#quote-consent').checked)e.preventDefault();});
  $('#copy-brief').addEventListener('click',async()=>{if(!$('#quote-consent').checked){$('#copy-status').textContent='Please agree to share the brief first.';return;}try{await navigator.clipboard.writeText(brief);$('#copy-status').textContent='Brief copied. Paste it into your preferred message. Nothing has been sent.';}catch{$('#copy-status').textContent='Copy isn’t available here. Select the brief above and copy it manually.';const range=document.createRange();range.selectNodeContents($('#brief-preview'));getSelection().removeAllRanges();getSelection().addRange(range);}});
  $('#preferences').addEventListener('click',()=>{document.querySelector('#district').scrollIntoView({behavior:paused?'instant':'smooth',block:'center'});$('#motion-toggle').focus({preventScroll:true});});
  $('.back-top').href='#';
})();

