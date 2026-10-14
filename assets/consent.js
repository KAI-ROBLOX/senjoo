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
    el.id='senjooCookieBanner';
    el.className='cookieBanner';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-label','\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc');
    el.innerHTML='<div class="cookieText"><b>\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc \u0648 \u0622\u0645\u0627\u0631 \u0633\u0627\u06cc\u062a</b><span>\u0633\u0646\u062c\u0648 \u0628\u0631\u0627\u06cc \u0641\u0647\u0645 \u0628\u0647\u062a\u0631 \u0639\u0645\u0644\u06a9\u0631\u062f \u0633\u0627\u06cc\u062a \u0627\u0632 Google Analytics \u0648 Microsoft Clarity \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0645\u06cc\u200c\u06a9\u0646\u062f. \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0622\u0645\u0627\u0631\u06cc \u0631\u0627 \u0628\u067e\u0630\u06cc\u0631\u06cc \u06cc\u0627 \u0631\u062f \u06a9\u0646\u06cc. \u062a\u0628\u0644\u06cc\u063a\u0627\u062a \u0634\u062e\u0635\u06cc\u200c\u0633\u0627\u0632\u06cc\u200c\u0634\u062f\u0647 \u062f\u0631 \u0627\u06cc\u0646 \u062a\u0646\u0638\u06cc\u0645 \u0641\u0639\u0627\u0644 \u0646\u0645\u06cc\u200c\u0634\u0648\u062f. <a href="privacy.html">\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc</a></span></div><div class="cookieActions"><button type="button" class="cookieReject">\u0631\u062f</button><button type="button" class="cookieAccept">\u067e\u0630\u06cc\u0631\u0641\u062a\u0646 \u0622\u0645\u0627\u0631</button></div>';
    document.body.appendChild(el);
    el.querySelector('.cookieAccept').addEventListener('click',function(){apply('granted');});
    el.querySelector('.cookieReject').addEventListener('click',function(){apply('denied');});
    return el;
  }
  function addPreferencesLink(){
    var copy=document.querySelector('.copy'); if(!copy || copy.querySelector('.cookiePrefs')) return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='cookiePrefs';
    btn.textContent='\u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc';
    btn.addEventListener('click',function(){var b=banner();b.hidden=false;});
    copy.appendChild(document.createTextNode(' · '));
    copy.appendChild(btn);
  }
  function init(){
    var v=getChoice();
    if(v==='granted'||v==='denied'){updateGoogle(v);updateClarity(v);}else{banner().hidden=false;}
    addPreferencesLink();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();