#!/usr/bin/env python3
"""Fixes the BookLoop HTML/CSS. Run it inside your project folder:  python fix_bookloop.py
Your old files are copied to the folder  backup-before-fix/  first."""
import glob, os, re, shutil, sys

if not glob.glob("*.html"):
    sys.exit("No .html files here. Open the terminal inside your BookLoop folder and try again.")

# 0. backup
os.makedirs("backup-before-fix", exist_ok=True)
for f in glob.glob("*.html") + glob.glob("*css*/*.css") + glob.glob("css/*.css"):
    dest = os.path.join("backup-before-fix", re.sub(r"[\\/ ]", "__", f))
    shutil.copy2(f, dest)

def read(p):
    with open(p, encoding="utf-8") as fh: return fh.read()
def write(p, s):
    with open(p, "w", encoding="utf-8", newline="\n") as fh: fh.write(s)

# 1. rename "bookloop css" -> "css"
if os.path.isdir("bookloop css") and not os.path.exists("css"):
    os.rename("bookloop css", "css")
css_path = "css/book.css"

# 2. CSS fixes
if os.path.exists(css_path):
    css = read(css_path)
    marker = "main { flex: 1; }"
    first = css.find(marker)
    second = css.find(marker, first + 1)
    buttons = css.find("/* ---------- buttons ---------- */")
    if first != -1 and second != -1 and buttons > second:        # remove the repeated block
        css = css[:second] + "/* ---------- header ---------- */\n\n" + css[buttons:]
    css = css.replace("#8A1C3C", "var(--danger)")                 # one colour variable
    css = re.sub(r"(--danger:\s*)var\(--danger\)", r"\1#8A1C3C", css)
    css = css.replace(".btn-yellow", ".btn-accent")
    if ".photo-picker input:focus-visible" not in css:
        css = css.replace(".photo-picker .hint {",
            ".photo-picker input:focus-visible + label { outline: 2px solid var(--danger); outline-offset: 2px; }\n.photo-picker .hint {", 1)
    write(css_path, css)
else:
    print("Could not find css/book.css, skipped the CSS fixes.")

# 3. HTML fixes
page_script = {"index": "home", "browse": "browse", "book": "book", "sell": "sell",
               "auth": "auth", "messages": "messages", "profile": "profile"}
for f in glob.glob("*.html"):
    h = read(f)
    h = h.replace("bookloop css/", "css/").replace("bookloop%20css/", "css/")
    h = h.replace("btn-yellow", "btn-accent")
    h = h.replace("My self", "My shelf").replace("platfrom", "platform")
    h = h.replace("Sell Your books Directly to Juniors.", "Sell your books directly to juniors.")

    # index: footer must come last, and every section belongs inside <main>
    if '<section class="cta-band">' in h and "</main>\n\n<footer" in h:
        h = h.replace('</main>\n\n<footer id="site-footer"></footer>\n', "", 1)
        i = h.find('<section class="cta-band">')
        j = h.find("</section>", i) + len("</section>")
        h = h[:j] + '\n</main>\n\n<footer id="site-footer"></footer>\n' + h[j:]

    # add the script tags if the page has none
    base = os.path.splitext(f)[0].rstrip("0123456789")
    name = page_script.get(base)
    if name and "<script" not in h and os.path.exists("js/%s.js" % name) and os.path.exists("js/ui.js"):
        tags = "".join('<script src="js/%s.js"></script>\n' % s for s in ("config", "store", "ui", name))
        h = h.replace("</body>", tags + "</body>", 1)
    write(f, h)

print("Done. Your old files are in backup-before-fix/. Open index.html and check each page.")
