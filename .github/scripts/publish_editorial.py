from pathlib import Path
import json,re,html,datetime,sys
ROOT=Path(__file__).resolve().parents[2]
Q=ROOT/".editorial/queue.json"; STATUS=ROOT/".editorial/status.json"; LAST=ROOT/".editorial/last_publish.json"; GUIDES=ROOT/"guides.html"; COMPARISONS=ROOT/"comparisons.html"; ARTICLES=ROOT/"articles.html"; SITEMAP=ROOT/"sitemap.xml"; HOME=ROOT/"index.html"
GUIDE_MARK="<!-- EDITORIAL_GUIDES_INSERT -->"; COMPARE_MARK="<!-- EDITORIAL_COMPARISONS_INSERT -->"; ARTICLE_MARK="<!-- EDITORIAL_ARTICLES_INSERT -->"; CAT_MARK="<!-- EDITORIAL_CATEGORY_INSERT -->"; HOME_START="<!-- EDITORIAL_HOME_LATEST_START -->"; HOME_END="<!-- EDITORIAL_HOME_LATEST_END -->"
def read(p): return p.read_text(encoding="utf-8")
def write(p,s): p.write_text(s,encoding="utf-8")
def extract(pattern,text,label):
    m=re.search(pattern,text,re.I|re.S)
    if not m: raise SystemExit(f"Missing {label}")
    return re.sub(r"<[^>]+>","",m.group(1)).strip()
def ensure_marker(path,marker):
    s=read(path)
    if marker in s:return
    # Insert at the end of the last card grid, immediately before its closing divs.
    # This avoids injecting the marker inside the final <a> card.
    m=list(re.finditer(r'(<div[^>]+class=["\'][^"\']*(?:hubGrid|grid3)[^"\']*["\'][^>]*>)(.*?)(</div>\s*</div>\s*</section>\s*</main>)',s,re.I|re.S))
    if not m: raise SystemExit(f"Could not place editorial marker in {path}")
    hit=m[-1]
    body=hit.group(2)
    repl=hit.group(1)+body+marker+hit.group(3)
    s=s[:hit.start()]+repl+s[hit.end():]
    write(path,s)

def update_home_latest(item):
    s=read(HOME)
    if HOME_START not in s or HOME_END not in s: raise SystemExit("Homepage latest markers missing")
    before,rest=s.split(HOME_START,1); block,after=rest.split(HOME_END,1)
    label="مقایسه" if item["slug"].startswith("compare-") else "راهنمای خرید"
    card=f'<a class="card" href="{html.escape(item["slug"])}"><img src="{html.escape(item["image"])}" alt="{html.escape(item["card_label"])}"><div class="body"><span class="kicker">{label}</span><h3>{html.escape(item["title"])}</h3><p>{html.escape(item["meta_description"])}</p></div></a>'
    cards=re.findall(r'<a class="card".*?</a>',block,re.S)
    cards=[x for x in cards if f'href="{item["slug"]}"' not in x]
    write(HOME,before+HOME_START+card+"".join(cards[:5])+HOME_END+after)

def validate_queue(doc):
    for key in ("slug","title","h1"):
        vals=[x[key].strip() for x in doc["items"]]
        if len(vals)!=len(set(vals)): raise SystemExit(f"Duplicate queue {key}")
def validate_draft(item,text):
    title=extract(r"<title>(.*?)</title>",text,"title"); h1=extract(r"<h1>(.*?)</h1>",text,"H1")
    if item["title"] not in title: raise SystemExit("Title mismatch")
    if h1!=item["h1"]: raise SystemExit("H1 mismatch")
    canonical=f"https://senjoo.ir/{item['slug']}"
    checks=[(f'rel="canonical" href="{canonical}"',"canonical"),('name="robots" content="index,follow"',"robots"),('"@type": "Article"',"Article schema")]
    for needle,label in checks:
        if needle not in text: raise SystemExit(f"{label} missing")
    if text.count('href="')<5: raise SystemExit("Internal links too thin")
def scan_duplicates(item):
    for p in ROOT.glob("*.html"):
        if p.name==item["slug"]:continue
        s=read(p)
        if item["title"] in s or f"<h1>{item['h1']}</h1>" in s: raise SystemExit(f"Duplicate topic/title in {p.name}")
doc=json.loads(read(Q));validate_queue(doc)
items=sorted([x for x in doc["items"] if x["status"]=="queued"],key=lambda x:(x["priority"],x["slug"]))
if not items: print("NO_QUEUED_ARTICLE");sys.exit(0)
item=items[0]; draft=ROOT/item["draft"]
if not draft.exists():raise SystemExit(f"Draft missing: {draft}")
text=read(draft);validate_draft(item,text);scan_duplicates(item)
today=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
text=text.replace("__PUBLISH_DATE__",today)
text=text.replace('<a href="comparisons.html">مقایسه</a><a href="about.html">','<a href="comparisons.html">مقایسه</a><a href="articles.html">مقالات</a><a href="about.html">')
text=text.replace('<a href="comparisons.html">مقایسه‌ها</a>','<a href="comparisons.html">مقایسه‌ها</a><a href="articles.html">مقالات</a>')
dest=ROOT/item["slug"]
if dest.exists():raise SystemExit(f"Destination already exists: {dest}")
write(dest,text)
hub=COMPARISONS if item["slug"].startswith("compare-") else GUIDES; hub_mark=COMPARE_MARK if hub==COMPARISONS else GUIDE_MARK
ensure_marker(hub,hub_mark); ensure_marker(ARTICLES,ARTICLE_MARK); category=ROOT/item["category_page"]; ensure_marker(category,CAT_MARK)
card=f'<a class="card" href="{html.escape(item["slug"])}"><img src="{html.escape(item["image"])}" alt="{html.escape(item["card_label"])}"><div class="body"><h3>{html.escape(item["title"])}</h3><p>{html.escape(item["meta_description"])}</p></div></a>'
g=read(hub)
if item["slug"] not in g: write(hub,g.replace(hub_mark,card+hub_mark))
a=read(ARTICLES)
if item["slug"] not in a: write(ARTICLES,a.replace(ARTICLE_MARK,card+ARTICLE_MARK))
c=read(category); cat_card=f'<a class="card" href="{html.escape(item["slug"])}"><img src="{html.escape(item["image"])}"><div class="body"><h3>{html.escape(item["card_label"])}</h3></div></a>'
if item["slug"] not in c: write(category,c.replace(CAT_MARK,cat_card+CAT_MARK))
update_home_latest(item)
sm=read(SITEMAP); url=f"https://senjoo.ir/{item['slug']}"
if url not in sm: write(SITEMAP,sm.replace("</urlset>",f'<url><loc>{url}</loc><lastmod>{today}</lastmod></url></urlset>'))
item["status"]="published"; item["published_at"]=today
reserve=sorted([x for x in doc["items"] if x["status"]=="backlog"],key=lambda x:(x["priority"],x["slug"]))
if reserve: reserve[0]["status"]="queued"; reserve[0]["promoted_at"]=today
doc["updated_at"]=today; write(Q,json.dumps(doc,ensure_ascii=False,indent=2))
counts={k:sum(1 for x in doc["items"] if x["status"]==k) for k in ("queued","backlog","published")}
write(STATUS,json.dumps({"publisher":"github-actions-static-html","schedule":doc["schedule"],"queue_floor":doc["queue_floor"],**counts,"last_publish":url},ensure_ascii=False,indent=2))
write(LAST,json.dumps({"slug":item["slug"],"url":url,"published_at":today},ensure_ascii=False,indent=2))
print("PUBLISHED",url)
