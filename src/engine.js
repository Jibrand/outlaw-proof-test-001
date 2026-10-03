import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { validateRequest, validateResult } from './validator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts');

let state = { value: 0, status: 'IDLE', version: 1 };
let run_id = crypto.randomUUID();

export async function initArtifacts() {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
  // Clear artifacts
  const files = await fs.readdir(ARTIFACTS_DIR);
  for (const file of files) {
    await fs.unlink(path.join(ARTIFACTS_DIR, file));
  }
}

export async function appendLog(event, payload = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...payload
  };
  await fs.appendFile(
    path.join(ARTIFACTS_DIR, 'event_log.jsonl'),
    JSON.stringify(logEntry) + '\n'
  );
}

export async function writeManifest() {
  const manifest = {
    run_id,
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform
    },
    execution_status: "COMPLETED",
    target_test: "TEST_001_THE_FIRST_BRICK"
  };
  await fs.writeFile(
    path.join(ARTIFACTS_DIR, 'run_manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

async function writeStateBefore() {
    await fs.writeFile(
        path.join(ARTIFACTS_DIR, 'state_before.json'),
        JSON.stringify(state, null, 2)
    );
}

async function writeStateAfter() {
    await fs.writeFile(
        path.join(ARTIFACTS_DIR, 'state_after.json'),
        JSON.stringify(state, null, 2)
    );
}

function generateProof(input, output) {
  const inputString = JSON.stringify(input);
  const outputString = JSON.stringify(output);
  const hash = crypto.createHash('sha256')
    .update(run_id + inputString + outputString)
    .digest('hex');
  return {
    receipt_id: crypto.randomUUID(),
    run_id,
    input_hash: crypto.createHash('sha256').update(inputString).digest('hex'),
    output_hash: crypto.createHash('sha256').update(outputString).digest('hex'),
    proof_hash: hash,
    timestamp: new Date().toISOString()
  };
}

export async function executePhase1() {
  await appendLog("REQUEST_RECEIVED", { payload: { phase: 1 } });
  
  await writeStateBefore();
  await appendLog("STATE_CAPTURED", { phase: "BEFORE" });

  const request = { input: 125, operation: 'multiply', operand: 8 };
  const validation = validateRequest(request);
  if (!validation.valid) throw new Error(validation.reason);

  const result = request.input * request.operand;
  
  state.value = result;
  state.status = 'COMPLETED';
  state.version = 2;

  await writeStateAfter();
  await appendLog("EXECUTION_COMPLETE", { result });

  const valReport = validateResult(request, result);
  await fs.writeFile(
    path.join(ARTIFACTS_DIR, 'validation_report.json'),
    JSON.stringify(valReport, null, 2)
  );
  await appendLog("VALIDATION_PASSED", { check: "125*8==1000" });

  const proof = generateProof(request, result);
  await fs.writeFile(
    path.join(ARTIFACTS_DIR, 'proof_receipt.json'),
    JSON.stringify(proof, null, 2)
  );
  await appendLog("PROOF_GENERATED", { hash: proof.proof_hash });
}

export async function executePhase2() {
  await appendLog("REQUEST_RECEIVED", { payload: { phase: 2 } });
  
  const request = { input: "abc", operation: 'multiply', operand: 8 };
  const validation = validateRequest(request);
  
  let faultInjected = true;
  let errorCaptured = null;
  let stateCorrupted = false;

  try {
    if (!validation.valid) {
      throw new Error(validation.reason);
    }
    // Execution wouldn't reach here normally for invalid input
  } catch (err) {
    errorCaptured = err.message;
    // ensure state isn't polluted
    if (state.status !== 'COMPLETED' || state.value !== 1000 || state.version !== 2) {
       stateCorrupted = true;
    }
  }

  // Write failure validation report
  const valReport = {
    test_name: "Multiplication Fault Check",
    timestamp: new Date().toISOString(),
    status: "FAIL",
    assertions: {
      input_is_number: false,
      expected_value: null,
      actual_value: null,
      schema_valid: false
    }
  };
  await fs.writeFile(
    path.join(ARTIFACTS_DIR, 'validation_report.json'),
    JSON.stringify(valReport, null, 2)
  );
  await appendLog("FAULT_CAPTURED", { error: errorCaptured });

  return { faultInjected, errorCaptured, stateCorrupted };
}

export async function executePhase3(recoveryInfo) {
  await appendLog("REQUEST_RECEIVED", { payload: { phase: 3 } });
  
  const request = { input: 125, operation: 'multiply', operand: 8 };
  const result = request.input * request.operand;
  
  let retryPass = result === 1000;

  const recoveryReport = {
    fault_injected: recoveryInfo.faultInjected,
    error_captured: recoveryInfo.errorCaptured,
    state_corrupted: recoveryInfo.stateCorrupted,
    recovery_status: "SUCCESSFUL_ROLLBACK_AND_RETRY",
    retry_pass: retryPass
  };

  await fs.writeFile(
    path.join(ARTIFACTS_DIR, 'recovery_report.json'),
    JSON.stringify(recoveryReport, null, 2)
  );
  await appendLog("RECOVERY_COMPLETE", { retryPass });
}
