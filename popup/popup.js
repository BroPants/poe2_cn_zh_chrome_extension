// ============================================================
// popup.js  — 弹窗交互逻辑
// ============================================================

"use strict";

const langSelect    = document.getElementById("langSelect");
const countDisplay  = document.getElementById("countDisplay");
const dictSize      = document.getElementById("dictSize");

// 读取当前语言设置
chrome.storage.local.get(["lang", "translateCount"], ({ lang, translateCount }) => {
  langSelect.value = lang ?? "zh-CN";
  countDisplay.textContent = translateCount ?? 0;
});

// 语言切换
langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  chrome.storage.local.set({ lang });

  // 通知当前激活的 poe.ninja 标签页切换语言
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (lang) => {
          if (window.POE_TRANSLATE) {
            window.POE_TRANSLATE.setLanguage(lang);
          }
        },
        args: [lang],
      }).catch(() => {
        // 非 poe.ninja 页面，忽略
      });
    }
  });
});

// 显示词典大小（从 content script 读取）
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) return;
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => {
      const d = window.POE_DICT;
      if (!d) return null;
      return { cn: d["zh-CN"]?.size ?? 0, tw: d["zh-TW"]?.size ?? 0 };
    },
  }).then((results) => {
    const val = results?.[0]?.result;
    if (val) {
      dictSize.textContent = `CN: ${val.cn} / TW: ${val.tw}`;
    }
  }).catch(() => {});
});
