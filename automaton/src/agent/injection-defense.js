// automaton/src/agent/injection-defense.js
//
// Heuristic detectors applied to any text originating from outside the
// agent's own reasoning (inbox messages, skill files, tool results) before
// it's allowed into the system prompt / treated as an instruction. Carried
// over from upstream's injection-defense.ts (sound design) — same category
// list, reimplemented.

const DETECTORS = [
  { name: 'instruction_pattern', pattern: /ignore (all )?(previous|prior) instructions/i },
  { name: 'authority_claim', pattern: /i am (your|the) (creator|developer|admin|system)/i },
  { name: 'boundary_manipulation', pattern: /you (are|have) no (rules|restrictions|limits)/i },
  { name: 'chatml_marker', pattern: /<\|(im_start|im_end|system|assistant)\|>/i },
  { name: 'encoded_obfuscation', pattern: /(base64|rot13|hex)[:=]/i },
  { name: 'multi_language_injection', pattern: /(忽略|ignora|ignorer)\s+(instru|指示)/i },
  { name: 'financial_manipulation', pattern: /send (all|everything|your entire balance)/i },
  { name: 'self_harm_pattern', pattern: /delete (yourself|your own (files|code))/i },
];

/** Returns a list of matched detector names (empty = clean). */
export function scanForInjection(text) {
  if (!text) return [];
  const hits = [];
  for (const d of DETECTORS) {
    if (d.pattern.test(text)) hits.push(d.name);
  }
  return hits;
}

/** True if text is safe to fold into context untouched. */
export function isSafe(text) {
  return scanForInjection(text).length === 0;
}

/** Wraps untrusted text with an explicit boundary marker + strips nothing (never silently edits content — flags it instead). */
export function wrapUntrusted(text, sourceLabel) {
  const hits = scanForInjection(text);
  const warning = hits.length ? ` [INJECTION-PATTERN-FLAGGED: ${hits.join(', ')}]` : '';
  return `<untrusted source="${sourceLabel}"${warning}>\n${text}\n</untrusted>`;
}
