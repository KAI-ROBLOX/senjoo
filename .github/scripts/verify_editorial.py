from pathlib import Path
import json,time,urllib.request,re,sys
ROOT=Path(__file__).resolve().parents[2]; p=ROOT/".editorial/last_publish.json"
if not p.exists(): print("NO_PUBLICATION_TO_VERIFY");sys.exit(0)
x=json.loads(p.read_text(encoding="utf-8"));url=x["url"];slug=x["slug"]
def get(u):
    req=urllib.request.Request(u,headers={"User-Agent":"SENJOO-Editorial-QA/1.0","Cache-Control":"no-cache"})
    with urllib.request.urlopen(req,timeout=20) as r:return r.status,r.read().decode("utf-8","replace")
article=None
for _ in range(20):
    try:
        status,body=get(url)
        if status==200 and f'rel="canonical" href="{url}"' in body: article=body;break
    except Exception: pass
    time.sleep(15)
if article is None: raise SystemExit("Live article did not become ready")
m=re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)',article,re.I)
if not m or "index" not in m.group(1).lower() or "follow" not in m.group(1).lower() or "noindex" in m.group(1).lower():raise SystemExit("robots/index-follow failed")
if '"@type": "Article"' not in article and '"@type":"Article"' not in article:raise SystemExit("Article schema missing live")
if article.count('href="')<5:raise SystemExit("Internal links missing live")
status,sm=get("https://senjoo.ir/sitemap.xml")
if status!=200 or url not in sm:raise SystemExit("Sitemap inclusion failed")
status,hub=get("https://senjoo.ir/guides.html")
if status!=200 or slug not in hub:raise SystemExit("Inbound guide hub link failed")
print("LIVE_VERIFY_OK",url)
