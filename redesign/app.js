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
    $('#scene-hint').textContent=['Ads & social — attention starts here.','Websites — turn interest into an enquiry.','Follow-up — give every enquiry a next step.'][index];document.dispatchEvent(new CustomEvent('district-stage',{detail:index}));openScenePanel(index);tone();
  }
  $$('.stage, .scene-label').forEach(el=>el.addEventListener('click',()=>setStage(Number(el.dataset.stage))));
  document.addEventListener('district-select',e=>setStage(e.detail));
  function resetScene(){document.dispatchEvent(new CustomEvent('district-reset'));$('#scene-inspector').hidden=true;$('#scene-hint').textContent=$('#district').dataset.renderMode==='static'?'Static 3D view. Explore each part below.':'Move to look around. Select a building to move closer.';}
  $('#scene-reset').addEventListener('click',resetScene);
  $('#scene-panel-close').addEventListener('click',()=>{resetScene();$('.scene-label[data-stage="'+stage+'"]').focus({preventScroll:true});});
  const scenePanels=[['01 / ADS & SOCIAL','Get discovered.','Meta ads and Instagram give your business a considered first impression. We scope the creative, destination and measurement around your goals.','Meta ads','ads'],['02 / WEBSITES','Give interest a home.','A responsive website explains your services, answers useful questions and makes requesting a quote feel straightforward.','Website or landing page','web'],['03 / FOLLOW-UP','Keep the conversation moving.','Connect the enquiry, the responsible person and the next action. Your actual tools and booking process shape the setup.','Full growth system','system']];
  function openScenePanel(index){const p=scenePanels[index];$('#scene-panel-kicker').textContent=p[0];$('#scene-panel-title').textContent=p[1];$('#scene-panel-copy').textContent=p[2];$('#scene-panel-quote').dataset.service=p[3];$('#scene-panel-explore').href='#service-'+p[4];$('#scene-inspector').hidden=false;}
  function openService(row){$$('.service-row').forEach(other=>{other.open=other===row;});document.dispatchEvent(new CustomEvent('district-stage',{detail:row.classList.contains('studio-web')?1:row.classList.contains('studio-system')?2:0}));requestAnimationFrame(()=>{const top=row.getBoundingClientRect().top;if(top<100||top>innerHeight*.55)row.scrollIntoView({behavior:paused?'instant':'smooth',block:'start'});});}
  $$('.service-row').forEach(row=>row.querySelector('summary').addEventListener('click',e=>{e.preventDefault();if(row.open)row.open=false;else openService(row);}));
  $('#scene-panel-explore').addEventListener('click',()=>{const row=$($('#scene-panel-explore').getAttribute('href'));if(row)openService(row);$('#scene-inspector').hidden=true;});
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

  const modelNotes=[["An editorial homepage introduces your business before asking for the next click.","Responsive pages, navigation and content form one deliberate experience.","A visible call to action leads to a brief your customer can review before sending."],["A clear message and visual idea give each ad a reason to exist.","Distinct creative angles can be tested—not just different colours of one ad.","Review spend and genuine enquiry quality together. No result is guaranteed."],["Your profile should feel unmistakably like your business.","Posts, stories and campaigns share a visual language without repeating one template.","The profile gives interested visitors a clear route to your website or an enquiry."],["An enquiry needs an agreed destination, not another forgotten inbox.","A clear owner and next action keep the conversation visible.","Your team follows up and records the outcome. This is an illustration—not a live booking."]];
  $$('.service-row').forEach((row,i)=>{row.querySelectorAll('[data-model-view]').forEach(button=>button.addEventListener('click',()=>{const view=Number(button.dataset.modelView);row.dataset.modelView=String(view);row.querySelectorAll('[data-model-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));row.querySelector('.model-explanation').textContent=modelNotes[i][view];tone();}));});
})();


