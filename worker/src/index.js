// THEHIVE Queen — edge implementation of the Command Center API slice.
// Same JSON shapes as backend/api/routes.py (/v11), persisted in D1.
// Auth: visitor-tier tokens issued freely from /auth/token and stored in D1.
// Write endpoints require a valid unexpired token (permissive if WORKER_ADMIN_KEY unset).
// Rate limit: 30 POST requests per IP per minute (D1-backed sliding window).
// Admin surfaces (WORKER_ADMIN_KEY protected) stay off-edge.

// SIZE_PROBE_20K_PLACEHOLDER - real file upload pending
const SIZE_PROBE = true;
