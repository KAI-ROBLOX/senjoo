(function(){
  var KEY='senjoo_consent_v1';
  function getChoice(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function setChoice(v){try{localStorage.setItem(KEY,v);}catch(e){}}
  function updateGoogle(v){
    if(typeof window.gtag!=='function') return;
    window.gtag('consent','update',{
      analytics_storage:v==='granted'?'granted':'denied',
      ad_storage:'denied',
      ad_user_data:'denied',
      ad_personalization:'denied'
    });
  }
  function updateClarity(v){
    if(typeof window.clarity!=='function') return;
    window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:v==='granted'?'granted':'denied'});
    if(v!=='granted'){try{window.clarity('consent',false);}catch(e){}}
  }
  function apply(v){
    setChoice(v); updateGoogle(v); updateClarity(v);
    var b=document.getElementById('senjooCookieBanner'); if(b) b.hidden=true;
  }
  function banner(){
    var el=document.getElementById('senjooCookieBanner'); if(el) return el;
    el=document.createElement('aside');
    el.id='senjooCookieBanner'; el.className='cookieBanner'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','??????? ???? ?????');
    el.innerHTML='<div class="cookieText"><b>???? ????? ? ???? ????</b><span>???? ???? ??? ???? ?????? ???? ?? Google Analytics ? Microsoft Clarity ??????? ??????. ???????? ??????? ????? ?? ?????? ?? ?? ???. ??????? ????????????? ?? ??? ????? ???? ???????. <a href="privacy.html">???? ?????</a></span></div><div class="cookieActions"><button type="button" class="cookieReject">??</button><button type="button" class="cookieAccept">??????? ????</button></div>';
    document.body.appendChild(el);
    el.querySelector('.cookieAccept').addEventListener('click',function(){apply('granted');});
    el.querySelector('.cookieReject').addEventListener('click',function(){apply('denied');});
    return el;
  }
  function addPreferencesLink(){
    var copy=document.querySelector('.copy'); if(!copy || copy.querySelector('.cookiePrefs')) return;
    var btn=document.createElement('button'); btn.type='button'; btn.className='cookiePrefs'; btn.textContent='??????? ???? ?????';
    btn.addEventListener('click',function(){var b=banner(); b.hidden=false; b.scrollIntoView({behavior:'smooth',block:'nearest'});});
    copy.appendChild(document.createTextNode(' ? ')); copy.appendChild(btn);
  }
  function init(){
    var v=getChoice();
    if(v==='granted' || v==='denied'){updateGoogle(v);updateClarity(v);} else {banner().hidden=false;}
    addPreferencesLink();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();