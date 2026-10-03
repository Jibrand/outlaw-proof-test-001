# OUTLAW PROOF LAW — EXTERNAL VALIDATION TEST 001: "THE FIRST BRICK"

A deterministic, self-contained Node.js (ESM) subsystem built to satisfy **Outlaw Proof Law** validation criteria.

> **Core Principle:** *If a component claims a capability, it must produce inspectable, verifiable artifacts proving execution.*

---

## 🏗️ Execution Architecture

This subsystem demonstrates a complete 6-phase lifecycle:
**REQUEST ➔ EXECUTION ➔ STATE ➔ VALIDATION ➔ EVIDENCE ➔ RECOVERY**

It executes three sequential test cycles in a single run:
1. **Phase 1 (Valid Execution):** Processes input request `125 * 8 = 1000`, captures state transitions, validates mathematical assertions, and issues a SHA-256 `proof_receipt.json`.
2. **Phase 2 (Fault Simulation):** Submits an intentionally invalid payload (`"abc"` or malformed request), captures the failure gracefully without throwing unhandled exceptions, verifies zero state corruption, and generates a `recovery_report.json`.
3. **Phase 3 (Deterministic Recovery):** Re-runs the original valid request to prove full state recovery without human intervention.

---

## 📁 Inspectable Artifact Suite (`/artifacts`)

Every execution populates the `/artifacts` directory with 7 verifiable proof files:

| Artifact File | Description |
| :--- | :--- |
| `run_manifest.json` | Execution metadata (Run ID, Node/OS environment, timestamps) |
| `event_log.jsonl` | Append-only lifecycle event stream in JSON Lines format |
| `state_before.json` | Initial system snapshot prior to request execution |
| `state_after.json` | Post-execution system state snapshot |
| `validation_report.json` | Assertion checks, schema verification, and `PASS`/`FAIL` metrics |
| `proof_receipt.json` | Cryptographic SHA-256 execution digest (Run ID + Input + Output) |
| `recovery_report.json` | Fault handling, error logs, rollback verification, and retry status |

---

## 🚀 Quickstart & Verification Guide

### Prerequisites
- Node.js v18 or higher

### Running the Subsystem
```bash
# Clone the repository
git clone <REPOSITORY_URL>
cd outlaw-proof-test-001

# Install dependencies (if any)
npm install

# Run the 3-phase execution cycle
npm start
```
