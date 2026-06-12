// ============================================================
// ui.js  — 页面右上角悬浮语言切换按钮
// ============================================================

"use strict";

const LANGS = [
  { value: "zh-CN", label: "简体" },
  { value: "zh-TW", label: "繁體" },
  { value: "off",   label: "OFF"  },
];

function createFloatButton() {
  const container = document.createElement("div");
  container.id = "poe-zh-ui";
  container.style.cssText = `
    position: fixed;
    top: 12px;
    right: 24px;
    z-index: 99999;
    display: flex;
    gap: 4px;
    background: rgba(20, 20, 24, 0.92);
    border: 1px solid #444;
    border-radius: 8px;
    padding: 6px 8px;
    font-family: system-ui, sans-serif;
    font-size: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.5);
    user-select: none;
  `;

  LANGS.forEach(({ value, label }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.lang = value;
    btn.style.cssText = `
      background: transparent;
      border: 1px solid transparent;
      color: #aaa;
      border-radius: 4px;
      padding: 3px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.15s;
    `;
    btn.addEventListener("click", () => {
      if (window.POE_TRANSLATE) {
        window.POE_TRANSLATE.setLanguage(value);
        updateActive(value);
      }
    });
    container.appendChild(btn);
  });

  document.body.appendChild(container);

  // 初始化高亮状态
  chrome.storage.local.get("lang", ({ lang }) => {
    updateActive(lang ?? "zh-CN");
  });
}

function updateActive(activeLang) {
  const container = document.getElementById("poe-zh-ui");
  if (!container) return;
  container.querySelectorAll("button").forEach((btn) => {
    const active = btn.dataset.lang === activeLang;
    btn.style.color = active ? "#e0c070" : "#aaa";
    btn.style.borderColor = active ? "#e0c070" : "transparent";
    btn.style.background = active ? "rgba(224,192,112,0.1)" : "transparent";
  });
}

// 等 body 就绪
if (document.body) {
  createFloatButton();
} else {
  document.addEventListener("DOMContentLoaded", createFloatButton);
}
