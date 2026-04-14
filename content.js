// 追踪鼠标右键位置
document.addEventListener("mouseover", e => { document.__itpLastHover = e.target; }, true);
document.addEventListener("contextmenu", e => { document.__itpLastHover = e.target; }, true);

const PANEL_ID   = "itp-panel";
const TOAST_ID   = "itp-toast";
const QUEUE_ID = "itp-queue-panel";

/* ══════════════════════════════════════
   Styles
══════════════════════════════════════ */
function injectStyles() {
  if (document.getElementById("itp-styles")) return;
  const s = document.createElement("style");
  s.id = "itp-styles";
  s.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; }

  /* ── Main panel ── */
  #itp-panel {
    position: fixed; top: 56px; right: 20px;
    width: 420px; height: 640px; max-height: 640px; min-height: 380px;
    background: rgba(255,255,255,0.82);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    border: 0.5px solid rgba(0,0,0,0.12); border-radius: 20px;
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.6) inset,
      0 22px 70px rgba(0,0,0,0.18),
      0 4px 16px rgba(0,0,0,0.08);
    z-index: 2147483640;
    font-family: -apple-system, "SF Pro Text", "Helvetica Neue", sans-serif;
    overflow: hidden; display: flex; flex-direction: column;
    animation: itp-appear 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
    user-select: none; color: #1e293b;
  }
  #itp-panel.itp-dragging { animation: none; box-shadow: 0 0 0 0.5px rgba(255,255,255,0.6) inset, 0 32px 80px rgba(0,0,0,0.24); }
  #itp-panel.itp-resizing { animation: none; user-select: none; }
  @keyframes itp-appear {
    from { opacity:0; transform: scale(0.92) translateY(12px); }
    to   { opacity:1; transform: scale(1)    translateY(0); }
  }

  /* Resize handles */
  .itp-rh { position: absolute; z-index: 10; }
  .itp-rh-e  { top:12px; right:-4px; width:8px; height:calc(100% - 24px); cursor:ew-resize; }
  .itp-rh-w  { top:12px; left:-4px;  width:8px; height:calc(100% - 24px); cursor:ew-resize; }
  .itp-rh-s  { bottom:-4px; left:12px; height:8px; width:calc(100% - 24px); cursor:ns-resize; }
  .itp-rh-n  { top:-4px; left:12px; height:8px; width:calc(100% - 24px); cursor:ns-resize; }
  .itp-rh-se { bottom:-4px; right:-4px; width:16px; height:16px; cursor:se-resize; }
  .itp-rh-sw { bottom:-4px; left:-4px;  width:16px; height:16px; cursor:sw-resize; }
  .itp-rh-ne { top:-4px; right:-4px; width:16px; height:16px; cursor:ne-resize; }
  .itp-rh-nw { top:-4px; left:-4px;  width:16px; height:16px; cursor:nw-resize; }

  /* ── Title bar ── */
  #itp-panel .itp-titlebar {
    display: flex; align-items: center; padding: 13px 16px 12px;
    cursor: grab; flex-shrink: 0; border-bottom: 0.5px solid rgba(0,0,0,0.08);
  }
  #itp-panel .itp-titlebar:active { cursor: grabbing; }
  #itp-panel .itp-wm { display: flex; gap: 7px; margin-right: 12px; }
  #itp-panel .itp-wm-btn {
    width: 13px; height: 13px; border-radius: 50%; border: none;
    cursor: pointer; padding: 0; transition: filter 0.12s;
  }
  #itp-panel .itp-wm-btn:hover { filter: brightness(0.85); }
  #itp-panel .itp-wm-close  { background: #FF5F57; }
  #itp-panel .itp-wm-min    { background: #FFBD2E; }
  #itp-panel .itp-wm-full   { background: #28CA41; }
  #itp-panel .itp-title-text {
    flex: 1; text-align: center; font-size: 13px; font-weight: 590;
    letter-spacing: -0.01em; color: rgba(0,0,0,0.85);
  }
  #itp-panel .itp-title-right { width: 72px; display: flex; justify-content: flex-end; }


  /* ── Body split ── */
  #itp-panel .itp-body { display: flex; flex: 1; overflow: hidden; }

  /* ── Left pane ── */
  #itp-panel .itp-left {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 14px 16px 20px; user-select: text;
    border-right: 0.5px solid rgba(0,0,0,0.07); scroll-behavior: smooth;
  }
  #itp-panel .itp-left::-webkit-scrollbar { width: 4px; }
  #itp-panel .itp-left::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }

  /* Preview */
  #itp-panel .itp-preview {
    width: 100%; height: auto; max-height: 320px; object-fit: contain;
    border-radius: 12px; margin-bottom: 12px; display: block;
    background: rgba(0,0,0,0.03);
  }

  /* Cache pill */
  #itp-panel .itp-cache-pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(52,199,89,0.12); border: 0.5px solid rgba(52,199,89,0.3);
    border-radius: 20px; padding: 3px 10px;
    font-size: 11px; font-weight: 500; color: #1a7f37; margin-bottom: 10px;
  }

  /* Section */
  #itp-panel .itp-section { margin-bottom: 11px; }
  #itp-panel .itp-section-label {
    font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.35);
    letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 5px;
  }

  /* Card */
  #itp-panel .itp-card-wrap { position: relative; }
  #itp-panel .itp-card {
    background: rgba(0,0,0,0.035); border-radius: 10px; padding: 10px 12px;
    font-size: 12px; line-height: 1.65; color: rgba(0,0,0,0.78);
    border: 1px solid transparent; outline: none; cursor: text;
    position: relative; transition: background 0.15s, border-color 0.15s;
  }
  #itp-panel .itp-card:hover { background: rgba(0,0,0,0.048); }
  #itp-panel .itp-card:focus {
    background: rgba(255,255,255,0.7); border-color: rgba(0,122,255,0.35);
    box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
  }
  #itp-panel .itp-card-hint { display: none; }

  /* Hover copy button */
  #itp-panel .itp-copy-btn {
    display: block; margin-top: 7px;
    height: 26px; padding: 0 12px; border-radius: 7px;
    background: rgba(0,0,0,0.05);
    border: 0.5px solid rgba(0,0,0,0.1); cursor: pointer;
    font-size: 12px; font-weight: 500; color: rgba(0,0,0,0.5);
    transition: background 0.15s, color 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  #itp-panel .itp-copy-btn:hover { background: rgba(0,122,255,0.1); color: rgba(0,100,220,0.9); border-color: rgba(0,122,255,0.2); }
  #itp-panel .itp-copy-btn:active { transform: scale(0.96); }
  #itp-panel .itp-copy-btn.copied { background: rgba(52,199,89,0.12); color: rgb(22,163,74); border-color: rgba(52,199,89,0.3); }

  /* Sync */
  #itp-panel .itp-card-syncing {
    color: rgba(0,122,255,0.5); font-size: 10px; margin-top: 4px;
    display: flex; align-items: center; gap: 4px; min-height: 16px;
    transition: opacity 0.2s;
  }
  #itp-panel .itp-card-syncing .itp-sync-dot {
    width: 5px; height: 5px; border-radius: 50%; background: rgba(0,122,255,0.5);
    animation: itp-sync-pulse 1s ease infinite;
  }
  @keyframes itp-sync-pulse {
    0%,100% { opacity:0.3; transform:scale(0.8); }
    50%      { opacity:1;   transform:scale(1.2); }
  }

  /* Copy ripple */
  #itp-panel .itp-ripple {
    position: absolute; inset: 0; border-radius: 10px;
    background: rgba(0,122,255,0.09); pointer-events: none;
    animation: itp-ripple 0.45s ease forwards;
  }
  @keyframes itp-ripple { 0%{opacity:1} 100%{opacity:0} }

  /* Tags */
  #itp-panel .itp-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  #itp-panel .itp-tag {
    display: flex; flex-direction: column; align-items: center;
    background: rgba(0,0,0,0.05); border: 0.5px solid rgba(0,0,0,0.1);
    border-radius: 7px; padding: 4px 10px; cursor: pointer;
    transition: background 0.15s, color 0.15s, transform 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  #itp-panel .itp-tag:hover { background: rgba(0,122,255,0.1); border-color: rgba(0,122,255,0.2); }
  #itp-panel .itp-tag:active { transform: scale(0.96); }
  #itp-panel .itp-tag.copied { background: rgba(52,199,89,0.12); border-color: rgba(52,199,89,0.3); }
  #itp-panel .itp-tag-en { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.6); white-space: nowrap; }
  #itp-panel .itp-tag-zh { font-size: 9.5px; font-weight: 400; color: rgba(0,0,0,0.35); margin-top: 1px; white-space: nowrap; }
  #itp-panel .itp-tag.copied .itp-tag-en { color: rgb(22,163,74); }
  #itp-panel .itp-tag.copied .itp-tag-zh { color: rgba(22,163,74,0.6); }

  /* Loading */
  #itp-panel .itp-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px; padding: 48px 0;
    color: rgba(0,0,0,0.4); font-size: 12px;
  }
  #itp-panel .itp-spinner {
    width: 24px; height: 24px; border: 2.5px solid rgba(0,0,0,0.1);
    border-top-color: rgba(0,122,255,0.7); border-radius: 50%;
    animation: itp-spin 0.75s linear infinite;
  }
  @keyframes itp-spin { to { transform: rotate(360deg); } }

  /* Error */
  #itp-panel .itp-error {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 14px; padding: 36px 20px; text-align: center;
  }
  #itp-panel .itp-error-icon {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255,59,48,0.1);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  #itp-panel .itp-error-title { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.8); }
  #itp-panel .itp-error-msg { font-size: 12px; color: rgba(0,0,0,0.45); line-height: 1.6; max-width: 220px; word-break: break-all; }
  #itp-panel .itp-error-actions { display: flex; gap: 8px; margin-top: 2px; }
  #itp-panel .itp-btn {
    height: 32px; padding: 0 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; transition: opacity 0.15s, transform 0.12s; font-family: inherit;
  }
  #itp-panel .itp-btn:active { transform: scale(0.96); opacity: 0.8; }
  #itp-panel .itp-btn-primary { background: rgb(0,122,255); color: white; }
  #itp-panel .itp-btn-primary:hover { background: rgb(0,100,220); }
  #itp-panel .itp-btn-ghost { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); }
  #itp-panel .itp-btn-ghost:hover { background: rgba(0,0,0,0.09); }

  /* ── Right sidebar ── */
  #itp-panel .itp-right {
    width: 128px; flex-shrink: 0; overflow-y: auto; overflow-x: hidden;
    background: rgba(0,0,0,0.018); padding: 10px 8px 16px;
    display: flex; flex-direction: column;
  }
  #itp-panel .itp-right::-webkit-scrollbar { width: 3px; }
  #itp-panel .itp-right::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
  #itp-panel .itp-sidebar-hd {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 9px; padding: 0 2px;
  }
  #itp-panel .itp-sidebar-hd-label {
    font-size: 11px; font-weight: 600; color: rgba(0,0,0,0.35);
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  #itp-panel .itp-sidebar-clear {
    font-size: 11px; font-weight: 500; color: rgba(255,59,48,0.8);
    background: none; border: none; cursor: pointer; padding: 0;
  }
  #itp-panel .itp-sidebar-clear:hover { color: rgb(255,59,48); }
  #itp-panel .itp-sidebar-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 6px; padding: 28px 4px;
    color: rgba(0,0,0,0.25); font-size: 11px; text-align: center; line-height: 1.5;
  }

  /* Thumb card */
  #itp-panel .itp-thumb {
    border-radius: 11px; overflow: hidden; cursor: pointer;
    border: 1.5px solid transparent; background: rgba(255,255,255,0.7);
    box-shadow: 0 1px 6px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06);
    margin-bottom: 8px; flex-shrink: 0; position: relative;
    transition: transform 0.18s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.18s ease, border-color 0.15s;
  }
  #itp-panel .itp-thumb:hover { transform: scale(1.02); box-shadow: 0 4px 14px rgba(0,0,0,0.12); }
  #itp-panel .itp-thumb:active { transform: scale(0.97); }
  #itp-panel .itp-thumb.active { border-color: rgba(0,122,255,0.7); box-shadow: 0 0 0 3px rgba(0,122,255,0.15); }
  #itp-panel .itp-thumb-img { width: 100%; height: 72px; object-fit: cover; display: block; background: rgba(0,0,0,0.05); }
  #itp-panel .itp-thumb-meta { padding: 6px 7px 5px; background: rgba(255,255,255,0.85); }
  #itp-panel .itp-thumb-style { font-size: 10.5px; font-weight: 600; color: rgba(0,0,0,0.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #itp-panel .itp-thumb-time { font-size: 9.5px; color: rgba(0,0,0,0.32); margin-top: 1px; }
  #itp-panel .itp-thumb-x {
    position: absolute; top: 5px; right: 5px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(0,0,0,0.52); border: none; cursor: pointer; padding: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
  }
  #itp-panel .itp-thumb-x svg { width: 8px; height: 8px; }
  #itp-panel .itp-thumb:hover .itp-thumb-x { opacity: 1; }
  #itp-panel .itp-thumb-x:hover { background: rgba(255,59,48,0.85); }





  #itp-panel .itp-sidebar-queue-status {
    margin-top: auto; padding-top: 10px;
    border-top: 0.5px solid rgba(0,0,0,0.07);
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; color: rgba(0,0,0,0.45); padding: 10px 2px 0;
  }
  #itp-panel .itp-sidebar-queue-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    background: rgb(0,122,255);
    animation: itp-sync-pulse 1s ease infinite;
  }


  #itp-queue-panel {
    position: fixed; top: 56px; right: 20px; width: 320px;
    background: rgba(255,255,255,0.88);
    backdrop-filter: saturate(180%) blur(24px); -webkit-backdrop-filter: saturate(180%) blur(24px);
    border: 0.5px solid rgba(0,0,0,0.12); border-radius: 20px;
    box-shadow: 0 0 0 0.5px rgba(255,255,255,0.6) inset, 0 16px 48px rgba(0,0,0,0.16);
    z-index: 2147483646; overflow: hidden;
    font-family: -apple-system, "SF Pro Text", sans-serif;
    animation: itp-appear 0.32s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  #itp-queue-panel .itp-q-header {
    padding: 14px 16px 10px; border-bottom: 0.5px solid rgba(0,0,0,0.07);
    background: rgba(248,248,248,0.6);
  }
  #itp-queue-panel .itp-q-title { font-size: 13px; font-weight: 600; color: rgba(0,0,0,0.85); margin-bottom: 8px; }
  #itp-queue-panel .itp-q-progress-track { height: 4px; background: rgba(0,0,0,0.08); border-radius: 2px; overflow: hidden; }
  #itp-queue-panel .itp-q-progress-bar { height: 100%; background: rgb(0,122,255); border-radius: 2px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
  #itp-queue-panel .itp-q-stats { display: flex; gap: 12px; margin-top: 8px; font-size: 11px; }
  #itp-queue-panel .itp-q-stat { color: rgba(0,0,0,0.45); }
  #itp-queue-panel .itp-q-stat b { font-weight: 600; }
  #itp-queue-panel .itp-q-stat.done b   { color: rgb(52,199,89); }
  #itp-queue-panel .itp-q-stat.cached b { color: rgb(100,180,255); }
  #itp-queue-panel .itp-q-stat.fail b   { color: rgb(255,59,48); }
  #itp-queue-panel .itp-q-list { max-height: 240px; overflow-y: auto; padding: 8px; }
  #itp-queue-panel .itp-q-list::-webkit-scrollbar { width: 3px; }
  #itp-queue-panel .itp-q-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
  #itp-queue-panel .itp-q-item { display: flex; align-items: center; gap: 9px; padding: 6px 8px; border-radius: 10px; margin-bottom: 3px; transition: background 0.12s; }
  #itp-queue-panel .itp-q-item:hover { background: rgba(0,0,0,0.03); }
  #itp-queue-panel .itp-q-thumb { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; flex-shrink: 0; background: rgba(0,0,0,0.06); }
  #itp-queue-panel .itp-q-info { flex: 1; overflow: hidden; }
  #itp-queue-panel .itp-q-item-style { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #itp-queue-panel .itp-q-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }
  .itp-q-icon.waiting  { color: rgba(0,0,0,0.25); font-size: 12px; }
  .itp-q-icon.running  { animation: itp-spin 0.75s linear infinite; display: inline-block; }
  .itp-q-icon.done     { color: rgb(52,199,89); }
  .itp-q-icon.cached   { color: rgb(0,122,255); }
  .itp-q-icon.failed   { color: rgb(255,59,48); }
  #itp-queue-panel .itp-q-footer {
    padding: 10px 14px; border-top: 0.5px solid rgba(0,0,0,0.07);
    display: flex; justify-content: space-between; align-items: center;
    background: rgba(248,248,248,0.6);
  }
  #itp-queue-panel .itp-q-footer-btn { height: 28px; padding: 0 12px; border-radius: 14px; border: none; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; transition: opacity 0.12s; }
  #itp-queue-panel .itp-q-cancel-btn { background: rgba(255,59,48,0.1); color: rgb(255,59,48); }
  #itp-queue-panel .itp-q-retry-btn  { background: rgba(0,122,255,0.1); color: rgb(0,122,255); }
  #itp-queue-panel .itp-q-close-btn  { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.5); }

  /* ── Toast ── */
  #itp-toast {
    position: fixed; bottom: 32px; left: 50%;
    transform: translateX(-50%) translateY(0);
    padding: 10px 20px; border-radius: 20px;
    background: rgba(50,50,52,0.88);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    font-size: 13px; font-weight: 500; color: #fff; letter-spacing: -0.01em;
    z-index: 2147483648;
    font-family: -apple-system, "SF Pro Text", sans-serif;
    animation: itp-toast-in 0.28s cubic-bezier(0.34,1.3,0.64,1) both;
    pointer-events: none; white-space: nowrap;
  }
  #itp-toast.success { background: rgba(52,199,89,0.9); }
  #itp-toast.error   { background: rgba(255,59,48,0.9); }
  @keyframes itp-toast-in {
    from { opacity:0; transform:translateX(-50%) translateY(10px) scale(0.9); }
    to   { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
  }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════
   Drag
══════════════════════════════════════ */
function makeDraggable(panel) {
  const bar = panel.querySelector(".itp-titlebar");
  let drag=false, sx,sy,sl,st;
  bar.addEventListener("mousedown", e => {
    if (e.target.closest(".itp-wm-btn")) return;
    drag=true; panel.classList.add("itp-dragging");
    const r=panel.getBoundingClientRect();
    sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top;
    panel.style.right="auto"; panel.style.left=sl+"px"; panel.style.top=st+"px";
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => {
    if(!drag) return;
    let l=sl+(e.clientX-sx), t=st+(e.clientY-sy);
    l=Math.max(8,Math.min(l,innerWidth-panel.offsetWidth-8));
    t=Math.max(8,Math.min(t,innerHeight-panel.offsetHeight-8));
    panel.style.left=l+"px"; panel.style.top=t+"px";
  });
  document.addEventListener("mouseup",()=>{ drag=false; panel.classList.remove("itp-dragging"); });
}

function makeResizable(panel) {
  const MIN_W = 420, MIN_H = 320;
  const MAX_W = 900, MAX_H = window.innerHeight - 40;
  let resizing = false, dir = "", sx, sy, sw, sh, sl, st;

  panel.querySelectorAll(".itp-rh").forEach(handle => {
    handle.addEventListener("mousedown", e => {
      e.preventDefault(); e.stopPropagation();
      resizing = true; dir = handle.dataset.dir;
      panel.classList.add("itp-resizing");
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY;
      sw = r.width;   sh = r.height;
      sl = r.left;    st = r.top;
      panel.style.right = "auto";
      panel.style.left  = sl + "px";
      panel.style.top   = st + "px";
    });
  });

  document.addEventListener("mousemove", e => {
    if (!resizing) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    let newW = sw, newH = sh, newL = sl, newT = st;

    if (dir.includes("e"))  newW = Math.min(MAX_W, Math.max(MIN_W, sw + dx));
    if (dir.includes("s"))  newH = Math.min(MAX_H, Math.max(MIN_H, sh + dy));
    if (dir.includes("w")) { newW = Math.min(MAX_W, Math.max(MIN_W, sw - dx)); newL = sl + (sw - newW); }
    if (dir.includes("n")) { newH = Math.min(MAX_H, Math.max(MIN_H, sh - dy)); newT = st + (sh - newH); }

    panel.style.width  = newW + "px";
    panel.style.height = newH + "px";
    panel.style.left   = newL + "px";
    panel.style.top    = newT + "px";
  });

  document.addEventListener("mouseup", () => {
    if (!resizing) return;
    resizing = false;
    panel.classList.remove("itp-resizing");
  });
}

/* ══════════════════════════════════════
   Helpers
══════════════════════════════════════ */
function fmt(ts) {
  const d=new Date(ts);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
function removePanel() { document.getElementById(PANEL_ID)?.remove(); }
function showToast(msg, status="info", ms=2200) {
  document.getElementById(TOAST_ID)?.remove();
  const t=document.createElement("div");
  t.id=TOAST_ID; t.className=status; t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.transition="opacity 0.2s"; t.style.opacity="0"; setTimeout(()=>t.remove(),220); }, ms);
}

/* ══════════════════════════════════════
   Main panel — sidebar
══════════════════════════════════════ */
function renderSidebar(panel, history, currentUrl, queueSummary) {
  const right = panel.querySelector(".itp-right");
  right.innerHTML = `
    <div class="itp-sidebar-hd">
      <span class="itp-sidebar-hd-label">历史</span>
      ${history.length ? `<button class="itp-sidebar-clear" id="itp-sa-clear">清空</button>` : ""}
    </div>
  `;
  if (!history.length) {
    right.innerHTML += `<div class="itp-sidebar-empty"><div style="font-size:20px;opacity:.2;margin-bottom:2px">🖼</div>分析图片后<br>将显示在此</div>`;
    return;
  }
  history.forEach(item => {
    const card = document.createElement("div");
    card.className = "itp-thumb" + (item.imageUrl===currentUrl ? " active" : "");
    card.dataset.url = item.imageUrl;
    card.innerHTML = `
      <img class="itp-thumb-img" src="${item.imageUrl}" data-itp-skip="1" onerror="this.style.opacity='.15'" />
      <button class="itp-thumb-x" data-x="${item.imageUrl}">
        <svg viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="itp-thumb-meta">
        <div class="itp-thumb-style">${item.result.style||"未知风格"}</div>
        <div class="itp-thumb-time">${fmt(item.time)}</div>
      </div>`;
    right.appendChild(card);
    card.addEventListener("click", e => {
      if (e.target.closest(".itp-thumb-x")) return;
      chrome.runtime.sendMessage({ type:"GET_CACHE_ITEM", imageUrl:item.imageUrl }, cached => {
        if (!cached) return;
        renderLeft(panel, cached.result, item.imageUrl, true);
        right.querySelectorAll(".itp-thumb").forEach(c => c.classList.toggle("active", c.dataset.url===item.imageUrl));
      });
    });
    card.querySelector(".itp-thumb-x").addEventListener("click", e => {
      e.stopPropagation();
      card.style.transition="transform 0.2s,opacity 0.18s"; card.style.transform="scale(0.8)"; card.style.opacity="0";
      setTimeout(()=>{
        chrome.runtime.sendMessage({ type:"DELETE_CACHE_ITEM", imageUrl:item.imageUrl }, ()=>{
          chrome.runtime.sendMessage({ type:"GET_HISTORY" }, res=>{
            const h=res?.history||[];
            const cur=panel.querySelector(".itp-preview")?.src||"";
            renderSidebar(panel, h, cur);
          });
        });
      }, 180);
    });
  });

  // 队列等待状态
  const pending = queueSummary ? (queueSummary.waiting + queueSummary.running) : 0;
  if (pending > 0) {
    const statusEl = document.createElement("div");
    statusEl.className = "itp-sidebar-queue-status";
    statusEl.innerHTML = `<div class="itp-sidebar-queue-dot"></div>还有 ${pending} 张等待分析`;
    right.appendChild(statusEl);
  }
  document.getElementById("itp-sa-clear")?.addEventListener("click", ()=>{
    chrome.runtime.sendMessage({ type:"CLEAR_HISTORY" }, ()=>{
      renderSidebar(panel, [], "");
      // 同时清空左侧内容
      const left = panel.querySelector(".itp-left");
      if (left) {
        left.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            height:100%;gap:10px;color:#62666d;font-size:13px;font-weight:510;letter-spacing:-0.13px;padding:40px 0;font-feature-settings:'cv01','ss03';">
            <div style="font-size:28px;opacity:0.25">🖼</div>
            右键图片开始分析
          </div>`;
      }
      document.getElementById("itp-title-txt").textContent = "ImageToPrompt";
      showToast("已清空历史记录");
    });
  });
}

/* ══════════════════════════════════════
   Main panel — left result
══════════════════════════════════════ */
function renderLeft(panel, result, imageUrl, fromCache) {
  const left = panel.querySelector(".itp-left");
  const tags = (result.tags||[]).map(t => {
    const en = typeof t === "object" ? (t.en||"") : t;
    const zh = typeof t === "object" ? (t.zh||"") : "";
    return `<span class="itp-tag" data-copy="${en}">
      <span class="itp-tag-en">${en}</span>
      ${zh ? `<span class="itp-tag-zh">${zh}</span>` : ""}
    </span>`;
  }).join("");
  left.innerHTML = `
    ${fromCache ? `<div class="itp-cache-pill">⚡ 来自缓存</div>` : ""}
    <img class="itp-preview" src="${imageUrl}" data-itp-skip="1" onerror="this.style.display:'none'" />
    <div class="itp-section">
      <div class="itp-section-label">English Prompt</div>
      <div class="itp-card-wrap">
        <div class="itp-card" id="itp-en" contenteditable="true" spellcheck="false">${result.english||""}</div>
        <button class="itp-copy-btn" id="itp-en-hint">复制</button>
      </div>
      <div class="itp-card-syncing" id="itp-en-sync"></div>
    </div>
    <div class="itp-section">
      <div class="itp-section-label">中文提示词</div>
      <div class="itp-card-wrap">
        <div class="itp-card" id="itp-zh" contenteditable="true" spellcheck="false">${result.chinese||""}</div>
        <button class="itp-copy-btn" id="itp-zh-hint">复制</button>
      </div>
      <div class="itp-card-syncing" id="itp-zh-sync"></div>
    </div>
    ${tags ? `<div class="itp-section"><div class="itp-section-label">关键词</div><div class="itp-tags">${tags}</div></div>` : ""}
    <div style="margin-top:16px;font-size:10.5px;color:rgba(0,0,0,0.25);text-align:center;letter-spacing:0.01em;">基于 AI 技术，由 CHEN 设计开发 · Chrome 插件</div>
  `;
  left.scrollTop = 0;

  // 复制逻辑（点击 hint 或双击卡片复制全文）
  function setupCopy(cardId, hintId) {
    const card = document.getElementById(cardId);
    const hint = document.getElementById(hintId);
    if (!card || !hint) return;
    hint.addEventListener("click", () => {
      navigator.clipboard.writeText(card.innerText.trim()).then(() => {
        const r = document.createElement("div"); r.className="itp-ripple"; card.appendChild(r);
        setTimeout(()=>r.remove(), 450);
        hint.textContent = "已复制 ✓";
        hint.classList.add("copied");
        setTimeout(() => { hint.textContent = "复制"; hint.classList.remove("copied"); }, 1800);
      });
    });
  }
  setupCopy("itp-en", "itp-en-hint");
  setupCopy("itp-zh", "itp-zh-hint");

  // 中英文同步翻译
  let syncTimer = null;
  let isSyncing = false;

  function setSyncStatus(syncEl, text) {
    if (!syncEl) return;
    if (text) {
      syncEl.innerHTML = `<div class="itp-sync-dot"></div>${text}`;
    } else {
      syncEl.innerHTML = "";
    }
  }

  async function translateAndSync(sourceText, targetLang, targetCardId, syncElId) {
    if (isSyncing || !sourceText.trim()) return;
    isSyncing = true;
    const syncEl = document.getElementById(syncElId);
    setSyncStatus(syncEl, targetLang === "zh" ? "正在翻译为中文…" : "Translating to English…");

    try {
      const settings = await new Promise(res => chrome.storage.local.get(["apiKey","baseUrl","model"], res));
      const baseUrl = (settings.baseUrl || "https://api.openai.com").replace(/\/$/, "");
      const model = settings.model || "gpt-4o";
      const prompt = targetLang === "zh"
        ? `Translate this AI image generation prompt to Chinese. Keep it as a prompt (comma-separated keywords/phrases), not a sentence. Return only the translation:\n${sourceText}`
        : `Translate this Chinese AI image generation prompt to English. Keep it as a prompt (comma-separated keywords/phrases). Return only the translation:\n${sourceText}`;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${settings.apiKey}`},
        body:JSON.stringify({ model, max_tokens:600, messages:[{role:"user",content:prompt}] })
      });
      if (!res.ok) throw new Error("翻译失败");
      const data = await res.json();
      const translated = data.choices?.[0]?.message?.content?.trim() || "";
      const targetCard = document.getElementById(targetCardId);
      if (targetCard && translated) targetCard.innerText = translated;
      setSyncStatus(syncEl, "");
    } catch(e) {
      setSyncStatus(syncEl, "同步失败");
      setTimeout(() => setSyncStatus(document.getElementById(syncElId), ""), 2000);
    } finally {
      isSyncing = false;
    }
  }

  function setupSync(sourceId, targetId, targetLang, sourceSyncId) {
    const source = document.getElementById(sourceId);
    if (!source) return;
    source.addEventListener("input", () => {
      clearTimeout(syncTimer);
      const syncEl = document.getElementById(sourceSyncId);
      setSyncStatus(syncEl, "等待输入…");
      syncTimer = setTimeout(() => {
        translateAndSync(source.innerText.trim(), targetLang, targetId, sourceSyncId);
      }, 800);
    });
  }
  setupSync("itp-en", "itp-zh", "zh", "itp-en-sync");
  setupSync("itp-zh", "itp-en", "en", "itp-zh-sync");

  // 点击 tag 复制英文关键词
  left.querySelectorAll(".itp-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const word = tag.dataset.copy;
      if (!word) return;
      navigator.clipboard.writeText(word).then(() => {
        const r = document.createElement("div"); r.className="itp-ripple"; tag.appendChild(r);
        setTimeout(()=>r.remove(), 450);
        tag.classList.add("copied");
        setTimeout(() => tag.classList.remove("copied"), 1800);
      });
    });
  });

}

/* ══════════════════════════════════════
   Main panel — scaffold
══════════════════════════════════════ */
function createPanel() {
  injectStyles(); removePanel();
  const p = document.createElement("div"); p.id=PANEL_ID;
  p.innerHTML = `
    <div class="itp-titlebar">
      <div class="itp-wm">
        <button class="itp-wm-btn itp-wm-close"  id="itp-wm-close"></button>
        <button class="itp-wm-btn itp-wm-min"    id="itp-wm-min"></button>
        <button class="itp-wm-btn itp-wm-full"   id="itp-wm-full"></button>
      </div>
      <div class="itp-title-text" id="itp-title-txt">ImageToPrompt</div>
      <div class="itp-title-right"></div>
    </div>
    <div class="itp-body">
      <div class="itp-left"></div>
      <div class="itp-right"></div>
    </div>
    <div class="itp-rh itp-rh-e"  data-dir="e"></div>
    <div class="itp-rh itp-rh-w"  data-dir="w"></div>
    <div class="itp-rh itp-rh-s"  data-dir="s"></div>
    <div class="itp-rh itp-rh-n"  data-dir="n"></div>
    <div class="itp-rh itp-rh-se" data-dir="se"></div>
    <div class="itp-rh itp-rh-sw" data-dir="sw"></div>
    <div class="itp-rh itp-rh-ne" data-dir="ne"></div>
    <div class="itp-rh itp-rh-nw" data-dir="nw"></div>
  `;
  document.body.appendChild(p);
  document.getElementById("itp-wm-close").onclick = removePanel;
  document.getElementById("itp-wm-min").onclick = ()=>{
    const b=p.querySelector(".itp-body");
    const c=b.style.display==="none";
    b.style.display=c?"":"none"; p.style.height=c?"":"auto"; p.style.minHeight=c?"":"unset";
  };
  document.getElementById("itp-wm-full").onclick = ()=>{
    const ex=p.dataset.expanded==="1";
    p.style.width=ex?"540px":"680px"; p.dataset.expanded=ex?"0":"1";
  };
  makeDraggable(p);
  makeResizable(p);
  return p;
}

function showLoading(imageUrl) {
  const p=createPanel();
  document.getElementById("itp-title-txt").textContent="正在分析…";
  p.querySelector(".itp-left").innerHTML=`
    <img class="itp-preview" src="${imageUrl}" data-itp-skip="1" onerror="this.style.display:'none'" />
    <div class="itp-loading"><div class="itp-spinner"></div><span>AI 正在识别图片内容</span></div>`;
  chrome.runtime.sendMessage({ type:"GET_HISTORY" }, res=>renderSidebar(p, res?.history||[], imageUrl));
}

function showResult(result, imageUrl, history, fromCache) {
  let p=document.getElementById(PANEL_ID); if(!p) p=createPanel();
  document.getElementById("itp-title-txt").textContent="提示词生成完成";
  renderLeft(p, result, imageUrl, fromCache);
  renderSidebar(p, history||[], imageUrl);
}

function showError(message, imageUrl) {
  let p=document.getElementById(PANEL_ID); if(!p) p=createPanel();
  document.getElementById("itp-title-txt").textContent="分析失败";
  const left=p.querySelector(".itp-left");
  left.innerHTML=`
    <img class="itp-preview" src="${imageUrl}" data-itp-skip="1" onerror="this.style.display:'none'" style="filter:brightness(0.7) saturate(0.4);" />
    <div class="itp-error">
      <div class="itp-error-icon">⚠️</div>
      <div class="itp-error-title">无法完成分析</div>
      <div class="itp-error-msg">${message||"发生未知错误，请检查 API 设置后重试"}</div>
      <div class="itp-error-actions">
        <button class="itp-btn itp-btn-primary" id="itp-retry-btn">重新分析</button>
        <button class="itp-btn itp-btn-ghost"   id="itp-settings-btn">检查设置</button>
      </div>
    </div>`;
  document.getElementById("itp-retry-btn").onclick  = ()=> chrome.runtime.sendMessage({ type:"REANALYZE", imageUrl });
  document.getElementById("itp-settings-btn").onclick = ()=> chrome.runtime.openOptionsPage();
}

/* ══════════════════════════════════════
   Batch select mode
══════════════════════════════════════ */
/* ══════════════════════════════════════
   Queue panel
══════════════════════════════════════ */
function renderQueuePanel(summary) {
  document.getElementById(QUEUE_ID)?.remove();
  const panel = document.createElement("div"); panel.id=QUEUE_ID;
  const finished = summary.done + summary.cached;
  const total = summary.total;
  const pct = total ? Math.round((finished/total)*100) : 0;
  const allDone = finished + summary.failed === total && summary.running === 0 && total > 0;

  // 全部完成且无失败 → 2秒后自动关闭
  if (allDone && summary.failed === 0) {
    setTimeout(() => {
      const qp = document.getElementById(QUEUE_ID);
      if (qp) {
        qp.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        qp.style.opacity = "0";
        qp.style.transform = "scale(0.95) translateY(-8px)";
        setTimeout(() => qp.remove(), 300);
      }
      showToast(`✅ ${finished} 张分析完成${summary.cached > 0 ? `，${summary.cached} 张来自缓存` : ""}`, "success", 2800);
    }, 2000);
  }

  panel.innerHTML = `
    <div class="itp-q-header">
      <div class="itp-q-title">${allDone ? "✅ 批量分析完成" : `批量分析中… ${finished}/${total}`}</div>
      <div class="itp-q-progress-track">
        <div class="itp-q-progress-bar" style="width:${pct}%"></div>
      </div>
      <div class="itp-q-stats">
        <div class="itp-q-stat done"><b>${summary.done}</b> 完成</div>
        <div class="itp-q-stat cached"><b>${summary.cached}</b> 缓存</div>
        <div class="itp-q-stat fail"><b>${summary.failed}</b> 失败</div>
        <div class="itp-q-stat"><b>${summary.waiting + summary.running}</b> 等待</div>
      </div>
    </div>
    <div class="itp-q-list">
      ${summary.items.map(item => {
        const icons = { waiting:"⏸", running:"⏳", done:"✅", cached:"⚡", failed:"❌", cancelled:"—" };
        const labels = { waiting:"等待中", running:"分析中…", done:item.style||"完成", cached:"来自缓存", failed:item.error||"失败", cancelled:"已取消" };
        return `
          <div class="itp-q-item">
            <img class="itp-q-thumb" src="${item.imageUrl}" data-itp-skip="1" onerror="this.style.opacity='.15'" />
            <div class="itp-q-info">
              <div class="itp-q-item-style">${labels[item.status]||""}</div>
              <div class="itp-q-item-status" style="color:${item.status==='failed'?'rgb(255,59,48)':item.status==='done'||item.status==='cached'?'rgb(52,199,89)':'rgba(0,0,0,0.3)'}">${item.status==='running'?'···':""}</div>
            </div>
            <div class="itp-q-icon ${item.status}">${icons[item.status]||""}</div>
          </div>`;
      }).join("")}
    </div>
    <div class="itp-q-footer">
      <div style="display:flex;gap:8px">
        ${summary.failed > 0 ? `<button class="itp-q-footer-btn itp-q-retry-btn" id="itp-q-retry">重试失败</button>` : ""}
        ${!allDone ? `<button class="itp-q-footer-btn itp-q-cancel-btn" id="itp-q-cancel">取消队列</button>` : ""}
      </div>
      <button class="itp-q-footer-btn itp-q-close-btn" id="itp-q-close">${allDone?"关闭":"后台运行"}</button>
    </div>
  `;
  document.body.appendChild(panel);

  document.getElementById("itp-q-close")?.addEventListener("click", ()=> panel.remove());
  document.getElementById("itp-q-cancel")?.addEventListener("click", ()=>{
    chrome.runtime.sendMessage({ type:"CANCEL_QUEUE" });
  });
  document.getElementById("itp-q-retry")?.addEventListener("click", ()=>{
    chrome.runtime.sendMessage({ type:"RETRY_FAILED" });
  });
}

/* ══════════════════════════════════════
   Image hover trigger
══════════════════════════════════════ */
const MIN_SIZE = 80;
const SKIP_SEL = "#itp-panel img, #itp-queue-panel img, .itp-q-thumb, .itp-thumb-img, .itp-preview, .itp-thumb-img";
let cachedUrls = new Set();
let currentHoverImg = null;

chrome.runtime.sendMessage({ type:"GET_HISTORY" }, res=>{
  (res?.history||[]).forEach(h=> cachedUrls.add(h.imageUrl));
});

// 滚动时同步更新所有 checkbox 位置

function markImage(img) {
  if (img.dataset.itpWrapped) return;
  if (img.dataset.itpSkip) return;
  if (img.closest("#itp-panel, #itp-queue-panel")) return;

  function tryMark() {
    // 优先用渲染尺寸判断，自然尺寸作为备用
    const w = img.offsetWidth  || img.naturalWidth;
    const h = img.offsetHeight || img.naturalHeight;
    if (w < MIN_SIZE || h < MIN_SIZE) return;
    const src = img.src || img.currentSrc;
    if (!src || (src.startsWith("data:") && src.length < 200)) return;
    if (img.dataset.itpWrapped) return; // 已标记则跳过

    img.dataset.itpWrapped = "1";
    img.dataset.itpSrc = src; // 固定存储分析时的 src，防止后续变化
    img.style.cursor = "pointer";

    img.addEventListener("mouseenter", ()=>{
      currentHoverImg = img;
    });

  }

  if (img.complete && img.naturalWidth) tryMark();
  else img.addEventListener("load", tryMark, { once:true });
}

function triggerAnalysis(imageUrl) {
  chrome.runtime.sendMessage({ type:"GET_CACHE_ITEM", imageUrl }, item=>{
    if (item) {
      chrome.runtime.sendMessage({ type:"GET_HISTORY" }, res=>{
        showResult(item.result, imageUrl, res?.history||[], true);
      });
    } else {
      showLoading(imageUrl);
      chrome.runtime.sendMessage({ type:"ANALYZE_IMAGE", imageUrl });
    }
  });
}

function scanImages() {
  document.querySelectorAll("img").forEach(img=>{
    if (!img.matches(SKIP_SEL)) markImage(img);
  });
}

const observer = new MutationObserver(mutations=>{
  mutations.forEach(m=>{
    m.addedNodes.forEach(node=>{
      if (node.nodeType!==1) return;
      if (node.tagName==="IMG" && !node.matches(SKIP_SEL)) markImage(node);
      node.querySelectorAll?.("img").forEach(img=>{ if(!img.matches(SKIP_SEL)) markImage(img); });
    });
  });
});
observer.observe(document.body, { childList:true, subtree:true });

if (document.readyState==="loading") document.addEventListener("DOMContentLoaded", scanImages);
else scanImages();

function refreshTriggerButtons(history) {
  cachedUrls = new Set((history||[]).map(h=>h.imageUrl));
  document.querySelectorAll(".itp-img-trigger").forEach(btn=>{
    const src=btn.dataset.src; const hit=cachedUrls.has(src);
    btn.classList.toggle("itp-cached", hit);
    btn.innerHTML = hit ? "⚡ 查看提示词" : "✨ 生成提示词";
  });
}

/* ══════════════════════════════════════
   Message listener
══════════════════════════════════════ */
chrome.runtime.onMessage.addListener(msg=>{
  if (msg.type === "SHOW_LOADING")   showLoading(msg.imageUrl);
  if (msg.type === "SHOW_RESULT")    { showResult(msg.result, msg.imageUrl, msg.history, msg.fromCache); refreshTriggerButtons(msg.history); }
  if (msg.type === "SHOW_ERROR")     showError(msg.message, msg.imageUrl);
  if (msg.type === "SHOW_TOAST")     showToast(msg.message, msg.status);
  if (msg.type === "QUEUE_UPDATE")   {
    const qp = document.getElementById(QUEUE_ID);
    if (qp) renderQueuePanel(msg.summary);
    const mp = document.getElementById(PANEL_ID);
    if (mp) {
      chrome.runtime.sendMessage({ type:"GET_HISTORY" }, res=>{
        renderSidebar(mp, res?.history||[], mp.querySelector(".itp-preview")?.src||"", msg.summary);
      });
    }
  }
  if (msg.type === "QUEUE_ITEM_DONE") {
    refreshTriggerButtons(msg.history);
    // 更新主面板历史栏
    const mp = document.getElementById(PANEL_ID);
    if (mp) renderSidebar(mp, msg.history||[], mp.querySelector(".itp-preview")?.src||"");
  }
});
