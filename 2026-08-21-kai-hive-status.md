# INSIDE_OUT — Kai hive status (query: current status of the hive)
Date: 2026-08-21
Source: INSIDE_OUT_DERIVED from live filesystem probes + tests (no autonomous runtime process)

KAI_STATUS_REPORT:
  grant_tier_effective: n/a (extension not loaded in a browser this session)
  kill_switch: n/a

  DONE (verified this probe):
    - Operator unit tests: 27 passed, 0 failed
    - Phase0 ingest --dry-run: EXIT 0
    - Medium channel files present: STANDING_CHANNEL, PERSISTENT_MEDIUM, ARCHITECT_LIVENESS, inbox, outbox, cycles
    - Extension package files present: manifest (valid JSON), background, shell, schemas, idb_map
    - Bridge five-layer py files exist as architectural stubs

  IN_PROGRESS: none (no live job runner / no browser body)

  NEXT:
    - Founder Chrome unpacked load smoke test (operator)
    - Ladybug + USC parquet for Phase0 real ingest
    - Bridge engines beyond stubs (operator/runtime)

  BLOCKED:
    - Live legal graph walks: LadybugDB installed=False, no parquet
    - Live Capture/Compress/Store/Inject/Evolve engines: stubs only
    - Autonomous continuous operator hands: no browser extension session in this environment

  BRIDGE_WORKS?:
    - File-persistent medium (voice + standing channel): YES
    - Full five-layer Bridge runtime: NO (stubs)
    - Cross-platform inject into external AIs: NO

  NARRATIVE: >
    Hive nervous system and dual-voice channel are on disk and addressable.
    Operator grant logic is unit-tested. Legal Phase0 is dry-run only.
    I do not have an independent body running in this probe — status is derived from the tree and tests.
