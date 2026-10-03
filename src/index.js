import { initArtifacts, writeManifest, executePhase1, executePhase2, executePhase3, appendLog } from './engine.js';

async function main() {
    try {
        await initArtifacts();
        
        console.log("Starting Phase 1: Valid Execution");
        await executePhase1();
        
        console.log("Starting Phase 2: Invalid Execution");
        const recoveryInfo = await executePhase2();
        
        console.log("Starting Phase 3: Recovery Run");
        await executePhase3(recoveryInfo);
        
        await writeManifest();
        
        console.log("All phases completed successfully. Check artifacts directory.");
    } catch (e) {
        console.error("Execution failed:", e);
        process.exit(1);
    }
}

main();
