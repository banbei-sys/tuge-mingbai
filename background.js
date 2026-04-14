const CACHE_KEY = "itp_cache";
const CACHE_MAX = 20;
let memCache = [];
async function loadCache() {
  const data = await chrome.storage.local.get(CACHE_KEY);
  memCache = data[CACHE_KEY] || [];
}
loadCache();


/* ── Context menu ── */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.remove("analyzeImage", () => { chrome.runtime.lastError; });
  chrome.contextMenus.create({
    id: "analyzeImage",
    title: "✨ 图个明白：生成 AI 提示词",
    contexts: ["image", "link", "video"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "analyzeImage") return;

  let imageUrl = info.srcUrl || "";
  if (!imageUrl && info.linkUrl && /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(info.linkUrl)) {
    imageUrl = info.linkUrl;
  }
  if (!imageUrl) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const el = document.__itpLastHover;
          if (!el) return null;
          if (el.tagName === "IMG") return el.src || el.currentSrc;
          const img = el.querySelector("img") || el.closest("a")?.querySelector("img");
          if (img) return img.src || img.currentSrc;
          const bg = getComputedStyle(el).backgroundImage;
          const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
          return m ? m[1] : null;
        }
      });
      imageUrl = results?.[0]?.result || "";
    } catch(e) {}
  }
  if (!imageUrl) {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const imgs = [...document.querySelectorAll("img")]
          .filter(i => i.offsetWidth > 80 && i.offsetHeight > 80)
          .sort((a,b) => (b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight));
        return imgs[0]?.src || imgs[0]?.currentSrc || null;
      }
    });
    imageUrl = res?.result || "";
  }
  if (!imageUrl) {
    chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST", message: "无法获取图片地址", status: "error" });
    return;
  }

  const settings = await chrome.storage.local.get(["apiKey", "baseUrl", "model"]);
  if (!settings.apiKey) {
    chrome.tabs.sendMessage(tab.id, { type: "SHOW_TOAST", message: "请先配置 API Key", status: "error" });
    chrome.runtime.openOptionsPage();
    return;
  }

  // 单图走老流程
  const hit = memCache.find(c => c.imageUrl === imageUrl);
  if (hit) {
    chrome.tabs.sendMessage(tab.id, { type: "SHOW_RESULT", result: hit.result, imageUrl, history: memCache.slice().reverse(), fromCache: true });
    return;
  }
  chrome.tabs.sendMessage(tab.id, { type: "SHOW_LOADING", imageUrl });
  try {
    const result = await analyzeImage(imageUrl, settings);
    await addToCache(imageUrl, result);
    chrome.tabs.sendMessage(tab.id, { type: "SHOW_RESULT", result, imageUrl, history: memCache.slice().reverse(), fromCache: false });
  } catch (err) {
    chrome.tabs.sendMessage(tab.id, { type: "SHOW_ERROR", message: err.message, imageUrl });
  }
});

/* ── Message handler ── */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (msg.type === "GET_HISTORY") {
    sendResponse({ history: memCache.slice().reverse() });
  }
  if (msg.type === "GET_CACHE_ITEM") {
    sendResponse(memCache.find(c => c.imageUrl === msg.imageUrl) || null);
  }
  if (msg.type === "DELETE_CACHE_ITEM") {
    memCache = memCache.filter(c => c.imageUrl !== msg.imageUrl);
    chrome.storage.local.set({ [CACHE_KEY]: memCache });
    sendResponse({ ok: true });
  }
  if (msg.type === "CLEAR_HISTORY") {
    memCache = [];
    chrome.storage.local.set({ [CACHE_KEY]: [] });
    sendResponse({ ok: true });
  }

  if (msg.type === "ANALYZE_IMAGE") {
    chrome.storage.local.get(["apiKey", "baseUrl", "model"]).then(async settings => {
      if (!settings.apiKey) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_TOAST", message: "请先配置 API Key", status: "error" });
        return;
      }
      const hit = memCache.find(c => c.imageUrl === msg.imageUrl);
      if (hit) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_RESULT", result: hit.result, imageUrl: msg.imageUrl, history: memCache.slice().reverse(), fromCache: true });
        return;
      }
      try {
        const result = await analyzeImage(msg.imageUrl, settings);
        await addToCache(msg.imageUrl, result);
        chrome.tabs.sendMessage(tabId, { type: "SHOW_RESULT", result, imageUrl: msg.imageUrl, history: memCache.slice().reverse(), fromCache: false });
      } catch (err) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_ERROR", message: err.message, imageUrl: msg.imageUrl });
      }
    });
    sendResponse({ ok: true });
  }

  if (msg.type === "REANALYZE") {
    chrome.storage.local.get(["apiKey", "baseUrl", "model"]).then(async settings => {
      chrome.tabs.sendMessage(tabId, { type: "SHOW_LOADING", imageUrl: msg.imageUrl });
      try {
        const result = await analyzeImage(msg.imageUrl, settings);
        await addToCache(msg.imageUrl, result);
        chrome.tabs.sendMessage(tabId, { type: "SHOW_RESULT", result, imageUrl: msg.imageUrl, history: memCache.slice().reverse(), fromCache: false });
      } catch (err) {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_ERROR", message: err.message, imageUrl: msg.imageUrl });
      }
    });
    sendResponse({ ok: true });
  }

  return true;
});

/* ── Cache helpers ── */
async function addToCache(imageUrl, result) {
  memCache = memCache.filter(c => c.imageUrl !== imageUrl);
  memCache.push({ imageUrl, result, time: Date.now() });
  if (memCache.length > CACHE_MAX) memCache.shift();
  await chrome.storage.local.set({ [CACHE_KEY]: memCache });
}

async function analyzeImage(imageUrl, settings) {
  const baseUrl = (settings.baseUrl || "https://api.openai.com").replace(/\/$/, "");
  const model = settings.model || "gpt-4o";
  const apiKey = settings.apiKey;

  let imageContent;
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    const mimeType = blob.type || "image/jpeg";
    imageContent = { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } };
  } catch {
    imageContent = { type: "image_url", image_url: { url: imageUrl } };
  }

  const systemPrompt = `You are an expert AI image prompt engineer specializing in Midjourney, Stable Diffusion, and DALL-E prompts.
Your task: analyze the provided image and return ONLY a raw JSON object — no markdown, no code fences.
JSON schema: { "english": "...", "chinese": "...", "style": "...", "tags": [{"en": "keyword", "zh": "关键词"}, ...] }
Provide 4-6 tags covering subject, style, lighting, color, and mood. Each tag must have both "en" and "zh" fields.`;

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, max_tokens: 1200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: [imageContent, { type: "text", text: "Analyze this image and return the JSON prompt object only." }] }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 错误 ${res.status}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return { english: text, chinese: "解析错误，请查看英文内容", style: "", tags: [] }; }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
