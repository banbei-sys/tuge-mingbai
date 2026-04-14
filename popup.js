async function checkStatus() {
  const settings = await chrome.storage.local.get(["apiKey", "model", "baseUrl"]);
  const card = document.getElementById("status-card");
  const text = document.getElementById("status-text");
  if (settings.apiKey) {
    card.className = "status-card ok";
    card.querySelector(".dot").className = "dot green";
    const model = settings.model || "gpt-4o";
    const base = (settings.baseUrl || "https://api.openai.com").replace(/https?:\/\//, "");
    text.textContent = `已配置 · ${model} · ${base}`;
  } else {
    card.className = "status-card warn";
    card.querySelector(".dot").className = "dot amber";
    text.textContent = "未配置 API Key，点击下方按钮设置";
  }
}

document.getElementById("open-options").onclick = () => {
  chrome.runtime.openOptionsPage();
};

document.getElementById("test-btn").onclick = async () => {
  const settings = await chrome.storage.local.get(["apiKey", "baseUrl", "model"]);
  if (!settings.apiKey) {
    alert("请先配置 API Key");
    return;
  }
  const btn = document.getElementById("test-btn");
  btn.textContent = "测试中...";
  btn.disabled = true;
  try {
    const baseUrl = (settings.baseUrl || "https://api.openai.com").replace(/\/$/, "");
    const model = settings.model || "gpt-4o";
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: "user", content: "hi" }]
      })
    });
    if (res.ok) {
      btn.textContent = "✅ 连接成功！";
    } else {
      const err = await res.json().catch(() => ({}));
      btn.textContent = "❌ " + (err.error?.message || `错误 ${res.status}`);
    }
  } catch (e) {
    btn.textContent = "❌ 网络错误";
  }
  setTimeout(() => {
    btn.textContent = "测试当前配置";
    btn.disabled = false;
  }, 2500);
};

checkStatus();
