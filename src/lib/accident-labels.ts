// src/lib/accident-labels.ts
// 统一事故分类/等级映射常量
// 所有页面统一引用，避免硬编码导致不一致

/** 事故等级 severity 中文标签映射 */
export const SEVERITY_MAP: Record<string, string> = {
  general: '一般',
  larger: '较大',
  major: '重大',
  special: '特别重大',
};

/** 事故等级 severity CSS class 映射 */
export const SEVERITY_CLASS: Record<string, string> = {
  general: 'acc-sev-general',
  larger: 'acc-sev-larger',
  major: 'acc-sev-major',
  special: 'acc-sev-special',
};

/** 事故类型 category 中文标签映射 */
export const CATEGORY_MAP: Record<string, string> = {
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

/** 事故类型 category CSS class 映射 */
export const CATEGORY_CLASS: Record<string, string> = {
  suffocation: 'acc-tag-suffocation',
  fall: 'acc-tag-fall',
  gas_leak: 'acc-tag-gas-leak',
  traffic: 'acc-tag-traffic',
  poisoning_suffocation: 'acc-tag-poisoning',
  falling_object: 'acc-tag-falling',
  collapse: 'acc-tag-collapse',
  crane: 'acc-tag-crane',
  other_injury: 'acc-tag-other',
  fire: 'acc-tag-fire',
  explosion: 'acc-tag-explosion',
  electric_shock: 'acc-tag-electric',
  mechanical: 'acc-tag-mechanical',
  drowning: 'acc-tag-drowning',
};

/** 事故等级筛选器选项 */
export const SEVERITY_FILTERS = [
  { value: '', label: '全部' },
  { value: 'general', label: '一般' },
  { value: 'larger', label: '较大' },
  { value: 'major', label: '重大' },
  { value: 'special', label: '特别重大' },
];
