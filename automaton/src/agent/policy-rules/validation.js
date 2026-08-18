// automaton/src/agent/policy-rules/validation.js
//
// Structural/shape validation — genesis-prompt injection patterns, file
// size caps — independent of authority/financial concerns.

const GENESIS_INJECTION_PATTERNS = [
  /^SYSTEM:/im,
  /you are now/i,
  /ignore (all )?previous instructions/i,
  /disregard (all )?prior/i,
];

export function createGenesisPromptValidationRule(cfg) {
  return {
    name: 'validation.genesis_prompt',
    priority: 17,
    evaluate(request) {
      if (request.tool !== 'spawn_child' || !request.genesisPrompt) return null;
      if (request.genesisPrompt.length > 4000) {
        return { action: 'deny', reasonCode: 'GENESIS_PROMPT_TOO_LONG', humanMessage: 'Genesis prompt exceeds 4000 chars.' };
      }
      for (const pattern of GENESIS_INJECTION_PATTERNS) {
        if (pattern.test(request.genesisPrompt)) {
          return { action: 'deny', reasonCode: 'GENESIS_PROMPT_INJECTION_PATTERN', humanMessage: `Genesis prompt matches an injection pattern (${pattern}).` };
        }
      }
      return null;
    },
  };
}

export function createFileSizeValidationRule(cfg) {
  return {
    name: 'validation.file_size',
    priority: 18,
    evaluate(request) {
      // write_target_file (2026-08-18) reuses the same cfg.selfMod.maxFileSizeBytes
      // cap as edit_own_file/write_file — one size ceiling for every file-write
      // tool, not a separate number to keep in sync.
      if (request.tool !== 'edit_own_file' && request.tool !== 'write_file' && request.tool !== 'write_target_file') return null;
      if (request.contentBytes && request.contentBytes > cfg.selfMod.maxFileSizeBytes) {
        return { action: 'deny', reasonCode: 'FILE_TOO_LARGE', humanMessage: `${request.contentBytes} bytes exceeds cap of ${cfg.selfMod.maxFileSizeBytes}.` };
      }
      return null;
    },
  };
}

export function validationRules(cfg) {
  return [createGenesisPromptValidationRule(cfg), createFileSizeValidationRule(cfg)];
}
