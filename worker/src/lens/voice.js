// worker/src/lens/voice.js
// Loads the founder's compressed voice from voice-of-the-hive/VOICE.md.
// Tries R2 FILES first. Cache-aware.

let _cache = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const VOICE_KEYS = [
  'founder/voice-of-the-hive/VOICE.md',
  'Project_file/Founders Visonary Folder/voice-of-the-hive/VOICE.md',
];

export async function loadVoice(env) {
  const now = Date.now();
  if (_cache && now - _cacheTs < CACHE_TTL_MS) return _cache;

  if (env.FILES) {
    for (const key of VOICE_KEYS) {
      try {
        const obj = await env.FILES.get(key);
        if (obj) {
          _cache = await obj.text();
          _cacheTs = now;
          return _cache;
        }
      } catch { /* try next */ }
    }
  }

  _cache = null;
  _cacheTs = now;
  return null;
}

export function invalidateVoiceCache() {
  _cache = null;
  _cacheTs = 0;
}
