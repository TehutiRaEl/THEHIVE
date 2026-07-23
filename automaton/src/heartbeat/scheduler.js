// automaton/src/heartbeat/scheduler.js
//
// A plain setInterval-driven scheduler instead of upstream's cron-parser +
// DB-backed leased-task design — a genuine simplification for a
// single-process automaton (no cron dependency, one less thing to install).
// `runOnce` is what tests and --selfcheck use; `startLoop` is what --run uses.

export async function runOnce(tasks) {
  const results = {};
  for (const task of tasks) {
    try {
      results[task.name] = await task.run();
    } catch (e) {
      results[task.name] = { error: String(e.message || e) };
    }
  }
  return results;
}

export function startLoop(tasks, intervalMs, onTick) {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    const results = await runOnce(tasks);
    if (onTick) onTick(results);
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };
  let timer = setTimeout(tick, 0);
  return { stop: () => { stopped = true; clearTimeout(timer); } };
}
