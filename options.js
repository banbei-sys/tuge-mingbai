async function loadSettings() {
  const s = await chrome.storage.local.get(["apiKey", "baseUrl", "model"]);
  if (s.apiKey) document.getElementById("api-key").value = s.apiKey;
  if (s.baseUrl) document.getElementById("base-url").value = s.baseUrl;
  if (s.model) {
    const sel = document.getElementById("model-select");
    const opt = Array.from(sel.options).find(o => o.value === s.model);
    if (opt) {
      sel.value = s.model;
    } else {
      sel.value = "custom";
      document.getElementById("model-custom").classList.add("show");
      document.getElementById("model-custom-input").value = s.model;
    }
  }
}

document.getElementById("model-select").addEventListener("change", function () {
  const custom = document.getElementById("model-custom");
  if (this.value === "custom") {
    custom.classList.add("show");
  } else {
    custom.classList.remove("show");
  }
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("base-url").value = btn.dataset.url;
  });
});

document.getElementById("toggle-eye").addEventListener("click", () => {
  const input = document.getElementById("api-key");
  input.type = input.type === "password" ? "text" : "password";
});

document.getElementById("save-btn").addEventListener("click", async () => {
  const apiKey = document.getElementById("api-key").value.trim();
  const baseUrl = document.getElementById("base-url").value.trim();
  const sel = document.getElementById("model-select");
  const model = sel.value === "custom"
    ? document.getElementById("model-custom-input").value.trim()
    : sel.value;

  if (!apiKey) {
    showFeedback("请输入 API Key", false);
    return;
  }
  if (!model) {
    showFeedback("请选择或输入模型名称", false);
    return;
  }

  await chrome.storage.local.set({ apiKey, baseUrl, model });
  showFeedback("✅ 设置已保存！", true);
});

document.getElementById("clear-btn").addEventListener("click", async () => {
  if (confirm("确认清除所有设置？")) {
    await chrome.storage.local.clear();
    document.getElementById("api-key").value = "";
    document.getElementById("base-url").value = "";
    document.getElementById("model-select").value = "gpt-4o";
    document.getElementById("model-custom").classList.remove("show");
    showFeedback("已清除", true);
  }
});

function showFeedback(msg, ok) {
  const el = document.getElementById("save-feedback");
  el.textContent = msg;
  el.style.color = ok ? "#16a34a" : "#dc2626";
  setTimeout(() => { el.textContent = ""; }, 3000);
}

loadSettings();
