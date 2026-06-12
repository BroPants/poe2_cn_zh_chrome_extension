// ============================================================
// observer.js  — MutationObserver，处理 React SPA 动态内容
// 须在 content.js 之前加载
// ============================================================

"use strict";

// 防抖：避免短时间大量 DOM 变动时重复触发
let _debounceTimer = null;
const DEBOUNCE_MS = 120;

function onMutations(mutations) {
  const nodesToTranslate = [];

  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        nodesToTranslate.push(node);
      }
    }
  }

  if (nodesToTranslate.length === 0) return;

  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    // content.js 加载后才能调用
    if (typeof translateElement === "function") {
      nodesToTranslate.forEach(translateElement);
    }
  }, DEBOUNCE_MS);
}

const observer = new MutationObserver(onMutations);

// 等 body 可用后再开始监听
function startObserver() {
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
}

startObserver();
