// src/lib/accident-labels.js
// Unified accident severity/category label mappings
// All pages import from here — NEVER hardcode again!

/** @type {Record<string, string>} */
export const SEVERITY_MAP = {
  general: '一般',
  larger: '较大',
  major: '重大',
  special: '特别重大',
};

/** @type {Record<string, string>} */
export const SEVERITY_CLASS = {
  general: 'acc-sev-general',
  larger: 'acc-sev-larger',
  major: 'acc-sev-major',
  special: 'acc-sev-special',
};

/** @type {Record<string, string>} */
export const CATEGORY_MAP = {
  suffocation: '窒息',
  fall: '高处坠落',
  gas_leak: '燃气泄漏',
  traffic: '交通',
  poisoning_suffocation: '中毒窒息',
  falling_object: '物体打击',
  collapse: '坍塌',
  crane: '起重伤害',
  other_injury: '其他伤害',
  fire: '火灾',
  explosion: '爆炸',
  electric_shock: '触电',
  mechanical: '机械伤害',
  drowning: '淹溺',
};

/** @type {Array<{value: string, label: string}>} */
export const SEVERITY_FILTERS = [
  { value: '', label: '全部' },
  { value: 'general', label: '一般' },
  { value: 'larger', label: '较大' },
  { value: 'major', label: '重大' },
  { value: 'special', label: '特别重大' },
];
