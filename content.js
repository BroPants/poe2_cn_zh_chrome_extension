// ============================================================
// content.js  — 主翻译逻辑
// 依赖：dictionary.js（须先加载）
// ============================================================

"use strict";

// 跳过这些标签内的文本，避免破坏脚本/样式/表单
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "SELECT", "BUTTON", "CANVAS", "SVG", "IFRAME",
]);

let currentLang = "zh-CN";
let dict = window.POE_DICT[currentLang];
let patterns = window.POE_PATTERNS[currentLang];
let translateCount = 0;

// 记录已翻译的文本节点及其原始英文内容，用于语言切换时还原
// Map<TextNode, originalNodeValue>
const nodeOriginals = new Map();

// ── 读取存储的语言偏好 ────────────────────────────────────
chrome.storage.local.get("lang", ({ lang }) => {
  currentLang = lang ?? "zh-CN";
  dict = window.POE_DICT[currentLang];
  patterns = window.POE_PATTERNS[currentLang];
  if (currentLang !== "off") {
    translateElement(document.body);
  }
});

// 罗马数字后缀正则（PoE2 宝石等级 I / II / III / IV / V / VI）
const ROMAN_SUFFIX_RE = /^(.+?)\s+(I{1,3}|IV|V|VI{0,3})$/;

// ── 翻译单个文本节点 ─────────────────────────────────────
function translateTextNode(node) {
  // 如果此节点曾被翻译，使用存储的原始英文（支持多次语言切换）
  const raw = nodeOriginals.has(node) ? nodeOriginals.get(node) : node.nodeValue;
  if (!raw || !raw.trim()) return;

  // 精确匹配
  if (dict.has(raw.trim())) {
    if (!nodeOriginals.has(node)) nodeOriginals.set(node, raw);
    const translated = dict.get(raw.trim());
    node.nodeValue = raw.replace(raw.trim(), translated);
    node.parentElement?.setAttribute("data-poe-original", raw.trim());
    translateCount++;
    return;
  }

  // 罗马数字后缀匹配（"Execute II" → "处决 II"）
  const rm = raw.trim().match(ROMAN_SUFFIX_RE);
  if (rm && dict.has(rm[1])) {
    if (!nodeOriginals.has(node)) nodeOriginals.set(node, raw);
    const translated = dict.get(rm[1]);
    node.nodeValue = raw.replace(raw.trim(), `${translated} ${rm[2]}`);
    node.parentElement?.setAttribute("data-poe-original", raw.trim());
    translateCount++;
    return;
  }

  // 正则模式匹配
  for (const rule of patterns) {
    const match = raw.match(rule.re);
    if (match) {
      if (!nodeOriginals.has(node)) nodeOriginals.set(node, raw);
      const translated = rule.fn(match);
      node.nodeValue = raw.replace(rule.re, translated);
      node.parentElement?.setAttribute("data-poe-original", raw.trim());
      translateCount++;
      return;
    }
  }
}

// ── 递归翻译元素及子节点 ─────────────────────────────────
function translateElement(el) {
  if (!el) return;

  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        // 跳过纯数字 / URL / 空白
        const text = node.nodeValue.trim();
        if (!text) return NodeFilter.FILTER_REJECT;
        if (/^[\d.,% ]+$/.test(text)) return NodeFilter.FILTER_SKIP;
        if (/^https?:\/\//.test(text)) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(translateTextNode);
}

// ── 还原所有翻译，恢复英文原文 ───────────────────────────
function restoreAll() {
  nodeOriginals.forEach((orig, node) => {
    if (node.parentElement) node.nodeValue = orig;
  });
  document.querySelectorAll("[data-poe-original]").forEach((el) => {
    el.removeAttribute("data-poe-original");
  });
}

// ── 切换语言 ─────────────────────────────────────────────
function setLanguage(lang) {
  currentLang = lang;
  chrome.storage.local.set({ lang });

  // 先还原所有文本节点为英文原文
  restoreAll();

  if (lang === "off") return;

  dict = window.POE_DICT[lang];
  patterns = window.POE_PATTERNS[lang];
  translateCount = 0;
  translateElement(document.body);

  // 通知 popup 更新计数
  chrome.storage.local.set({ translateCount });
}

// ── 暴露给 ui.js / popup.js ──────────────────────────────
window.POE_TRANSLATE = { setLanguage, getCurrentLang: () => currentLang };
