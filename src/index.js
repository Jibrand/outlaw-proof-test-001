import { initArtifacts, writeManifest, executePhase1, executePhase2, executePhase3, generateProofAndAcceptance } from './engine.js';

async function main() {
    try {
        await initArtifacts();
        
        console.log("Starting Phase 1: Valid Execution");
        const phase1Status = await executePhase1();
        
        console.log("Starting Phase 2: Invalid Execution");
        const recoveryInfo = await executePhase2();
        
        console.log("Starting Phase 3: Recovery Run");
        const phase3Status = await executePhase3(recoveryInfo);
        
        await writeManifest();
        
        console.log("Generating final Cryptographic Proof and Acceptance Summary");
        const phaseGates = {
            phase_1_execution: phase1Status,
            phase_2_fault_isolation: recoveryInfo.phase2Gate,
            phase_3_recovery: phase3Status
        };
        
        const allPass = await generateProofAndAcceptance(phaseGates);
        
        console.log("All phases completed. Check artifacts directory.");
        
        if (!allPass) {
            console.error("Acceptance Gate Failed.");
            process.exit(1);
        } else {
            console.log("Acceptance Gate Passed.");
            process.exit(0);
        }
    } catch (e) {
        console.error("Execution failed:", e);
        process.exit(1);
    }
}

main();
