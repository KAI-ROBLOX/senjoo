(function(){
  if(window.__senjooEventsLoaded) return;
  window.__senjooEventsLoaded=true;
  function clean(v,max){return String(v||'').replace(/\s+/g,' ').trim().slice(0,max||120);}
  function type(href){var u=(href||'').split('?')[0].split('#')[0];if(/(^|\/)guide-[^/]+\.html$/i.test(u))return'guide';if(/(^|\/)compare-[^/]+\.html$/i.test(u))return'comparison';if(/(^|\/)(beauty|technology|home)\.html$/i.test(u))return'category';return'';}
  function ga(n,p){try{if(typeof window.gtag==='function')window.gtag('event',n,Object.assign({transport_type:'beacon'},p||{}));}catch(e){}}
  function cl(n){try{if(typeof window.clarity==='function')window.clarity('event',n);}catch(e){}}
  window.senjooTrack=function(n,p){ga(n,p||{});cl(n);};
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a)return;
    var href=a.getAttribute('href')||'', text=clean(a.textContent,80);
    if(a.matches('.acts .btn')&&/search\.html/i.test(href)){window.senjooTrack('choose_buy_click',{link_text:text,link_url:href});return;}
    var t=type(href);
    if(t==='guide')window.senjooTrack('guide_open',{content_type:'guide',item_id:href,link_text:text});
    else if(t==='comparison')window.senjooTrack('comparison_open',{content_type:'comparison',item_id:href,link_text:text});
    else if(t==='category')window.senjooTrack('category_open',{content_type:'category',item_id:href,link_text:text});
    if(a.dataset&&a.dataset.affiliate==='true')window.senjooTrack('affiliate_click',{link_url:href,link_text:text,merchant:a.dataset.merchant||'',placement:a.dataset.placement||'',product_id:a.dataset.product||''});
    try{var u=new URL(href,location.href);if(/^https?:$/i.test(u.protocol)&&u.hostname!==location.hostname)window.senjooTrack('outbound_click',{link_url:u.href,link_domain:u.hostname,link_text:text});}catch(err){}
  },true);
  document.addEventListener('submit',function(e){
    var f=e.target;if(!f||!f.matches('form.search'))return;
    var i=f.querySelector('input[name="q"],#q'),term=clean(i&&i.value,80);
    if(term)window.senjooTrack('search',{search_term:term,search_source:location.pathname});
  },true);
  if(/\/search\.html$/i.test(location.pathname)){var q=clean(new URLSearchParams(location.search).get('q'),80);if(q)window.senjooTrack('search_results_view',{search_term:q});}
  var p=location.pathname.split('/').pop()||'index.html';
  if(/^guide-.*\.html$/i.test(p))window.senjooTrack('guide_view',{item_id:p});
  else if(/^compare-.*\.html$/i.test(p))window.senjooTrack('comparison_view',{item_id:p});
})();