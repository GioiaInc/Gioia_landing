"""
Flask UI for Gemini image generation.

Usage:
    cd image_gen && python3 app.py

Opens at http://localhost:5000
"""

import os
import uuid
import threading
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from google import genai
from google.genai import types
from PIL import Image
import io

from generate import slugify, OUTPUT_DIR, DEFAULT_MODEL

load_dotenv(Path(__file__).parent / ".env")

app = Flask(__name__)

# ---------------------------------------------------------------------------
# In-memory job store
# ---------------------------------------------------------------------------
jobs: dict[str, dict] = {}
jobs_lock = threading.Lock()


def _generate_job(client: genai.Client, job_id: str, prompt: str, aspect_ratio: str, ref_images: list[Image.Image] | None = None):
    """Run generation in a background thread and update job status."""
    try:
        contents: list = [prompt]
        if ref_images:
            contents.extend(ref_images)

        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size="4K",
                ),
            ),
        )

        saved = []
        slug = slugify(prompt)
        img_count = 0
        for part in response.parts:
            if part.inline_data is not None:
                image = part.as_image()
                filename = f"{slug}_{job_id[:8]}_{img_count}.png"
                filepath = OUTPUT_DIR / filename
                image.save(str(filepath))
                saved.append(filename)
                img_count += 1

        if not saved:
            text_resp = ""
            for part in response.parts:
                if part.text is not None:
                    text_resp += part.text
            with jobs_lock:
                jobs[job_id].update(status="error", error=text_resp or "No image returned")
        else:
            with jobs_lock:
                jobs[job_id].update(status="done", images=saved)

    except Exception as e:
        with jobs_lock:
            jobs[job_id].update(status="error", error=str(e))


# ---------------------------------------------------------------------------
# API routes
# ---------------------------------------------------------------------------
@app.post("/generate")
def generate():
    prompt = request.form.get("prompt", "").strip()
    aspect_ratio = request.form.get("aspect_ratio", "16:9")

    if not prompt:
        return jsonify(error="Prompt is required"), 400
    if aspect_ratio not in ("16:9", "9:16", "1:1"):
        return jsonify(error="Invalid aspect ratio"), 400

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return jsonify(error="GOOGLE_API_KEY not set"), 500

    # Load reference images if provided (up to 3)
    ref_images = []
    for ref_file in request.files.getlist("ref_image"):
        if ref_file and ref_file.filename:
            ref_images.append(Image.open(io.BytesIO(ref_file.read())))
    ref_images = ref_images[:3]

    client = genai.Client(api_key=api_key)
    job_id = uuid.uuid4().hex

    with jobs_lock:
        jobs[job_id] = dict(status="pending", prompt=prompt, aspect_ratio=aspect_ratio, images=[], error=None)

    thread = threading.Thread(target=_generate_job, args=(client, job_id, prompt, aspect_ratio, ref_images or None), daemon=True)
    thread.start()

    return jsonify(job_id=job_id)


@app.get("/status/<job_id>")
def status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if not job:
        return jsonify(error="Unknown job"), 404
    return jsonify(job)


@app.get("/gallery")
def gallery():
    images = sorted(
        [f.name for f in OUTPUT_DIR.iterdir() if f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")],
        key=lambda n: os.path.getmtime(OUTPUT_DIR / n),
        reverse=True,
    )
    return jsonify(images=images)


@app.get("/outputs/<path:filename>")
def serve_output(filename: str):
    return send_from_directory(OUTPUT_DIR, filename)


# ---------------------------------------------------------------------------
# Frontend — single page served from memory
# ---------------------------------------------------------------------------
INDEX_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Image Generator</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0c;--surface:#131317;--border:#1e1e26;
  --text:#e0dfe6;--muted:#6e6d78;--accent:#8b7bf7;--accent-hover:#a090ff;
  --error:#e05555;--radius:10px;
}
html{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:24px 16px}

h1{font-size:1.3rem;font-weight:600;margin-bottom:24px;letter-spacing:-.02em;color:var(--muted)}

/* ---- prompt bar ---- */
.prompt-bar{display:flex;gap:10px;width:100%;max-width:860px;margin-bottom:20px;flex-wrap:wrap;align-items:center}
.prompt-bar input[type=text]{
  flex:1;min-width:200px;padding:12px 16px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);color:var(--text);font-size:.95rem;outline:none;transition:border .2s;
}
.prompt-bar input[type=text]:focus{border-color:var(--accent)}
.prompt-bar select{
  padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  color:var(--text);font-size:.88rem;cursor:pointer;outline:none;
}
.prompt-bar button{
  padding:10px 28px;background:var(--accent);border:none;border-radius:var(--radius);
  color:#fff;font-size:.92rem;font-weight:600;cursor:pointer;transition:background .2s;white-space:nowrap;
}
.prompt-bar button:hover{background:var(--accent-hover)}
.prompt-bar button:disabled{opacity:.5;cursor:not-allowed}

/* ---- ref image upload ---- */
.ref-upload{display:flex;align-items:center;gap:6px}
.ref-upload label{
  padding:10px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
  color:var(--muted);font-size:.85rem;cursor:pointer;transition:border-color .2s;white-space:nowrap;
}
.ref-upload label:hover{border-color:var(--accent);color:var(--text)}
.ref-upload label.dragover{border-color:var(--accent);color:var(--text);background:rgba(139,123,247,.1)}
.ref-upload label.full{opacity:.4;pointer-events:none}
.ref-upload input[type=file]{display:none}
.ref-thumbs{display:flex;gap:5px}
.ref-thumb-item{
  position:relative;width:38px;height:38px;border-radius:6px;overflow:visible;border:1px solid var(--border);flex-shrink:0;
}
.ref-thumb-item img{width:100%;height:100%;object-fit:cover;border-radius:5px}
.ref-thumb-item .ref-x{
  position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:var(--error);color:#fff;
  border:none;border-radius:50%;font-size:10px;line-height:16px;text-align:center;cursor:pointer;padding:0;
}

/* ---- tabs ---- */
.tabs-header{display:flex;gap:4px;width:100%;max-width:860px;overflow-x:auto;padding-bottom:4px;margin-bottom:2px}
.tab-btn{
  padding:8px 18px;background:var(--surface);border:1px solid var(--border);border-bottom:none;
  border-radius:var(--radius) var(--radius) 0 0;color:var(--muted);font-size:.82rem;cursor:pointer;
  white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis;transition:color .2s,background .2s;
  position:relative;
}
.tab-btn.active{background:var(--bg);color:var(--text);border-color:var(--border)}
.tab-btn .close{
  margin-left:8px;opacity:.4;font-size:.75rem;
}
.tab-btn .close:hover{opacity:1}

.tabs-body{width:100%;max-width:860px;border:1px solid var(--border);border-radius:0 var(--radius) var(--radius) var(--radius);background:var(--surface);min-height:200px;margin-bottom:36px}
.tab-pane{display:none;padding:24px;text-align:center}
.tab-pane.active{display:block}
.tab-pane .prompt-text{color:var(--muted);font-size:.85rem;margin-bottom:16px;word-break:break-word}
.tab-pane .error{color:var(--error);margin-top:12px;font-size:.88rem}
.tab-pane img{max-width:100%;border-radius:var(--radius);margin-top:8px}
.tab-pane a.download{
  display:inline-block;margin-top:12px;padding:8px 20px;background:var(--accent);color:#fff;
  text-decoration:none;border-radius:var(--radius);font-size:.85rem;font-weight:500;
}
.tab-pane a.download:hover{background:var(--accent-hover)}

/* spinner */
.spinner{display:inline-block;width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:32px auto}
@keyframes spin{to{transform:rotate(360deg)}}

/* ---- gallery ---- */
.gallery-section{width:100%;max-width:860px}
.gallery-section h2{font-size:1rem;font-weight:600;color:var(--muted);margin-bottom:14px}
.gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.gallery-grid a{display:block;overflow:hidden;border-radius:var(--radius);border:1px solid var(--border);transition:border-color .2s}
.gallery-grid a:hover{border-color:var(--accent)}
.gallery-grid img{width:100%;display:block}

.empty{color:var(--muted);font-size:.88rem;padding:40px 0;text-align:center}
</style>
</head>
<body>

<h1>image generator</h1>

<form class="prompt-bar" id="promptForm">
  <input type="text" id="promptInput" placeholder="Describe the image you want to generate..." autofocus>
  <div class="ref-upload">
    <label for="refImage" id="refLabel">Ref (0/3)</label>
    <input type="file" id="refImage" accept="image/*">
    <div class="ref-thumbs" id="refThumbs"></div>
  </div>
  <select id="aspectRatio">
    <option value="16:9">&#9644; Landscape</option>
    <option value="9:16">&#9647; Portrait</option>
    <option value="1:1">&#9632; Square</option>
  </select>
  <button type="submit">Generate</button>
</form>

<div class="tabs-header" id="tabsHeader"></div>
<div class="tabs-body" id="tabsBody">
  <div class="empty" id="emptyTabs">Submit a prompt to get started</div>
</div>

<div class="gallery-section">
  <h2>gallery</h2>
  <div class="gallery-grid" id="galleryGrid"></div>
</div>

<script>
const tabs = [];          // {id, prompt, el_btn, el_pane, interval}
let activeTab = null;

// ---- ref images (up to 3) ----
const MAX_REFS = 3;
const refFiles = [];      // array of File objects
const refInput = document.getElementById('refImage');
const refLabel = document.getElementById('refLabel');
const refThumbs = document.getElementById('refThumbs');

function updateRefUI() {
  refLabel.textContent = `Ref (${refFiles.length}/${MAX_REFS})`;
  refLabel.classList.toggle('full', refFiles.length >= MAX_REFS);
  refThumbs.innerHTML = '';
  refFiles.forEach((file, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'ref-thumb-item';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ref-x';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => { refFiles.splice(i, 1); updateRefUI(); });
    wrap.appendChild(img);
    wrap.appendChild(btn);
    refThumbs.appendChild(wrap);
  });
}

function addRefFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (refFiles.length >= MAX_REFS) return;
  refFiles.push(file);
  updateRefUI();
}

function addRefFiles(files) {
  for (const f of files) { if (refFiles.length >= MAX_REFS) break; addRefFile(f); }
}

function clearRefs() {
  refFiles.length = 0;
  refInput.value = '';
  updateRefUI();
}

refInput.addEventListener('change', () => { addRefFiles(refInput.files); refInput.value = ''; });

// drag-and-drop on the label
refLabel.addEventListener('dragover', e => { e.preventDefault(); refLabel.classList.add('dragover'); });
refLabel.addEventListener('dragleave', () => refLabel.classList.remove('dragover'));
refLabel.addEventListener('drop', e => {
  e.preventDefault();
  refLabel.classList.remove('dragover');
  addRefFiles(e.dataTransfer.files);
});

// also allow drop anywhere on the page
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
  e.preventDefault();
  const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
  addRefFiles(files);
});

// ---- submit ----
document.getElementById('promptForm').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.getElementById('promptInput');
  const prompt = input.value.trim();
  if (!prompt) return;
  const aspect = document.getElementById('aspectRatio').value;

  const fd = new FormData();
  fd.append('prompt', prompt);
  fd.append('aspect_ratio', aspect);
  for (const f of refFiles) fd.append('ref_image', f);

  input.value = '';
  clearRefs();

  const res = await fetch('/generate', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.error) { alert(data.error); return; }

  createTab(data.job_id, prompt);
});

// ---- tabs ----
function createTab(jobId, prompt) {
  document.getElementById('emptyTabs').style.display = 'none';

  const btn = document.createElement('button');
  btn.className = 'tab-btn';
  btn.innerHTML = `${esc(prompt.slice(0, 36))}${prompt.length > 36 ? '...' : ''}<span class="close">&times;</span>`;
  btn.addEventListener('click', e => {
    if (e.target.classList.contains('close')) { removeTab(jobId); return; }
    switchTab(jobId);
  });
  document.getElementById('tabsHeader').appendChild(btn);

  const pane = document.createElement('div');
  pane.className = 'tab-pane';
  pane.innerHTML = `<div class="prompt-text">${esc(prompt)}</div><div class="spinner"></div>`;
  document.getElementById('tabsBody').appendChild(pane);

  const interval = setInterval(() => pollStatus(jobId), 2000);
  tabs.push({id: jobId, prompt, el_btn: btn, el_pane: pane, interval});
  switchTab(jobId);
}

function switchTab(jobId) {
  activeTab = jobId;
  for (const t of tabs) {
    const active = t.id === jobId;
    t.el_btn.classList.toggle('active', active);
    t.el_pane.classList.toggle('active', active);
  }
}

function removeTab(jobId) {
  const idx = tabs.findIndex(t => t.id === jobId);
  if (idx === -1) return;
  const t = tabs[idx];
  clearInterval(t.interval);
  t.el_btn.remove();
  t.el_pane.remove();
  tabs.splice(idx, 1);
  if (activeTab === jobId) {
    if (tabs.length) switchTab(tabs[Math.max(0, idx - 1)].id);
    else { activeTab = null; document.getElementById('emptyTabs').style.display = ''; }
  }
}

async function pollStatus(jobId) {
  const tab = tabs.find(t => t.id === jobId);
  if (!tab) return;
  try {
    const res = await fetch(`/status/${jobId}`);
    const data = await res.json();
    if (data.status === 'done') {
      clearInterval(tab.interval);
      let html = `<div class="prompt-text">${esc(tab.prompt)}</div>`;
      for (const img of data.images) {
        html += `<img src="/outputs/${encodeURIComponent(img)}" alt="Generated image">`;
        html += `<br><a class="download" href="/outputs/${encodeURIComponent(img)}" download="${esc(img)}">Download</a>`;
      }
      tab.el_pane.innerHTML = html;
      loadGallery();
    } else if (data.status === 'error') {
      clearInterval(tab.interval);
      tab.el_pane.innerHTML = `<div class="prompt-text">${esc(tab.prompt)}</div><div class="error">${esc(data.error)}</div>`;
    }
  } catch {}
}

// ---- gallery ----
async function loadGallery() {
  try {
    const res = await fetch('/gallery');
    const data = await res.json();
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = data.images.map(img =>
      `<a href="/outputs/${encodeURIComponent(img)}" target="_blank"><img src="/outputs/${encodeURIComponent(img)}" loading="lazy" alt=""></a>`
    ).join('');
  } catch {}
}
loadGallery();

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
</script>
</body>
</html>"""


@app.get("/")
def index():
    return INDEX_HTML


if __name__ == "__main__":
    app.run(debug=True, port=5000)
