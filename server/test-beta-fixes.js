/**
 * Maphia Beta Bug Fix Tests
 * 
 * Tests Bugs 2-5 by simulating multiplayer Socket.io connections against the running server.
 * Bug 1 (AsyncStorage playerName persistence) requires manual device testing.
 * 
 * Usage:
 *   1. Start the server: npm run dev
 *   2. Run tests: node test-beta-fixes.js
 */

const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3001';
const TIMEOUT = 15000;

// Helpers
function createSocket() {
    return io(SERVER_URL, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        timeout: 10000,
    });
}

function waitForEvent(socket, event, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout waiting for '${event}'`)), timeout);
        socket.once(event, (data) => {
            clearTimeout(timer);
            resolve(data);
        });
    });
}

function emitWithCallback(socket, event, data, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout on '${event}' callback`)), timeout);
        socket.emit(event, data, (response) => {
            clearTimeout(timer);
            resolve(response);
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ ${message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

// ============================================================
// Bug 2: User-friendly error messages on join
// ============================================================
async function testBug2() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BUG 2: User-friendly join error messages');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Test 2a: Invalid room code
    const s1 = createSocket();
    await waitForEvent(s1, 'connect');

    const res1 = await emitWithCallback(s1, 'join_room', { roomCode: 'ZZZZZ', name: 'TestPlayer' });
    assert(res1.success === false, 'Joining invalid room returns success=false');
    assert(res1.error === 'Room not found', `Error message is "Room not found" (got: "${res1.error}")`);

    // Test 2b: Room is full (create room with maxPlayers=5, fill it, then try one more)
    const host = createSocket();
    await waitForEvent(host, 'connect');
    const createRes = await emitWithCallback(host, 'create_room', {
        name: 'Host',
        settings: { maxPlayers: 5 }
    });
    const roomCode = createRes.roomCode;
    assert(createRes.success === true, `Room created: ${roomCode}`);

    // Join 4 more players (5 total including host)
    const fillers = [];
    for (let i = 0; i < 4; i++) {
        const s = createSocket();
        await waitForEvent(s, 'connect');
        const joinRes = await emitWithCallback(s, 'join_room', { roomCode, name: `Filler${i}` });
        assert(joinRes.success === true, `Player Filler${i} joined`);
        fillers.push(s);
    }

    // Now try to join as 6th player → should fail with "Room is full"
    const overflow = createSocket();
    await waitForEvent(overflow, 'connect');
    const overflowRes = await emitWithCallback(overflow, 'join_room', { roomCode, name: 'Overflow' });
    assert(overflowRes.success === false, 'Joining full room returns success=false');
    assert(overflowRes.error === 'Room is full', `Error message is "Room is full" (got: "${overflowRes.error}")`);

    // Test 2c: Game already in progress
    // Start the game first (all players need to be ready)
    for (const s of fillers) {
        s.emit('set_ready', { isReady: true });
    }
    await sleep(500);

    const startRes = await emitWithCallback(host, 'start_game', {});
    assert(startRes.success === true, 'Game started successfully');

    await sleep(500);

    // Try to join an in-progress game
    const lateJoiner = createSocket();
    await waitForEvent(lateJoiner, 'connect');
    const lateRes = await emitWithCallback(lateJoiner, 'join_room', { roomCode, name: 'LatePlayer' });
    assert(lateRes.success === false, 'Joining in-progress game returns success=false');
    assert(lateRes.error === 'Game already in progress', `Error message is "Game already in progress" (got: "${lateRes.error}")`);

    // Cleanup
    [s1, host, overflow, lateJoiner, ...fillers].forEach(s => s.disconnect());
    console.log('  [cleanup] All Bug 2 sockets disconnected');
}

// ============================================================
// Bug 3: night_results event with guardian save info
// ============================================================
async function testBug3() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BUG 3: night_results event + guardian save info');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create room with 5 players
    const sockets = [];
    const host = createSocket();
    await waitForEvent(host, 'connect');
    sockets.push(host);

    const createRes = await emitWithCallback(host, 'create_room', {
        name: 'Host',
        settings: { maxPlayers: 7, maphiaCount: 1 }
    });
    const roomCode = createRes.roomCode;
    assert(createRes.success === true, `Room created: ${roomCode}`);

    // Join 4 more players
    for (let i = 0; i < 4; i++) {
        const s = createSocket();
        await waitForEvent(s, 'connect');
        const joinRes = await emitWithCallback(s, 'join_room', { roomCode, name: `Player${i}` });
        assert(joinRes.success === true, `Player${i} joined`);
        sockets.push(s);
    }

    // Ready up all players (host is auto-ready for some setups, but set explicitly)
    for (const s of sockets) {
        s.emit('set_ready', { isReady: true });
    }
    await sleep(500);

    // Collect role assignments
    const roles = {};
    const rolePromises = sockets.map((s, i) => {
        return new Promise((resolve) => {
            s.once('role_assigned', (data) => {
                roles[s.id] = { role: data.role, name: i === 0 ? 'Host' : `Player${i - 1}`, teammates: data.teammates };
                resolve();
            });
        });
    });

    // Start game
    const startRes = await emitWithCallback(host, 'start_game', {});
    assert(startRes.success === true, 'Game started');

    await Promise.all(rolePromises);

    console.log('  Roles assigned:');
    for (const [id, info] of Object.entries(roles)) {
        console.log(`    ${info.name}: ${info.role}`);
    }

    // Wait for night phase
    await sleep(500);

    // Find Maphia, Guardian, and a Civilian
    let maphiaSocket = null, guardianSocket = null, civilianSocket = null;
    for (const s of sockets) {
        const role = roles[s.id]?.role;
        if (role === 'maphia' && !maphiaSocket) maphiaSocket = s;
        if (role === 'guardian' && !guardianSocket) guardianSocket = s;
        if (role === 'civilian' && !civilianSocket) civilianSocket = s;
    }

    assert(maphiaSocket !== null, 'Found Maphia player');
    assert(guardianSocket !== null, 'Found Guardian player');
    assert(civilianSocket !== null, 'Found Civilian player');

    // Wait for night phase to start
    await new Promise((resolve) => {
        const check = (data) => {
            if (data.phase === 'night') resolve();
        };
        // Listen on all sockets
        host.on('phase_changed', check);
        // If already in night (from role_reveal timeout), wait
        setTimeout(() => resolve(), 12000);
    });
    await sleep(500);

    // Set up night_results listener on ALL sockets BEFORE voting
    const nightResultsPromises = sockets.map(s => {
        return waitForEvent(s, 'night_results', 30000);
    });

    // Maphia kills a civilian
    const maphiaVoteRes = await emitWithCallback(maphiaSocket, 'submit_night_vote', {
        targetId: civilianSocket.id,
    });
    assert(maphiaVoteRes.success === true, 'Maphia vote submitted');

    // Guardian saves someone (a different civilian or themselves? Let's save the same civilian)
    // Guardian can't save self, so save the targeted civilian
    const guardianSaveRes = await emitWithCallback(guardianSocket, 'submit_guardian_save', {
        targetId: civilianSocket.id,
    });
    assert(guardianSaveRes.success === true, 'Guardian save submitted');

    // Wait for night results on all sockets
    const allResults = await Promise.all(nightResultsPromises);

    // Verify Bug 3: night_results event received by ALL clients
    assert(allResults.length === sockets.length, `night_results received by all ${sockets.length} clients`);

    // Check for guardianSavedId/guardianSavedName fields
    const firstResult = allResults[0];
    assert('guardianSavedId' in firstResult, 'night_results has guardianSavedId field');
    assert('guardianSavedName' in firstResult, 'night_results has guardianSavedName field');
    assert(firstResult.guardianSavedId === civilianSocket.id, 'guardianSavedId matches the saved player');
    assert(firstResult.saved === true, 'saved=true (Guardian saved the targeted player)');

    console.log('  Night results payload:', JSON.stringify(firstResult, null, 2));

    // Cleanup
    sockets.forEach(s => s.disconnect());
    console.log('  [cleanup] All Bug 3 sockets disconnected');
}

// ============================================================
// Bug 4: Simultaneous Maphia + Guardian night voting
// ============================================================
async function testBug4() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BUG 4: Simultaneous night voting (early resolve)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const sockets = [];
    const host = createSocket();
    await waitForEvent(host, 'connect');
    sockets.push(host);

    const createRes = await emitWithCallback(host, 'create_room', {
        name: 'Host4',
        settings: { maxPlayers: 7, maphiaCount: 1 }
    });
    const roomCode = createRes.roomCode;

    for (let i = 0; i < 4; i++) {
        const s = createSocket();
        await waitForEvent(s, 'connect');
        await emitWithCallback(s, 'join_room', { roomCode, name: `P${i}` });
        sockets.push(s);
    }

    for (const s of sockets) {
        s.emit('set_ready', { isReady: true });
    }
    await sleep(500);

    // Collect roles
    const roles = {};
    const rolePromises = sockets.map((s, i) => {
        return new Promise((resolve) => {
            s.once('role_assigned', (data) => {
                roles[s.id] = data.role;
                resolve();
            });
        });
    });

    await emitWithCallback(host, 'start_game', {});
    await Promise.all(rolePromises);

    let maphiaSocket = null, guardianSocket = null, targetSocket = null;
    for (const s of sockets) {
        if (roles[s.id] === 'maphia' && !maphiaSocket) maphiaSocket = s;
        if (roles[s.id] === 'guardian' && !guardianSocket) guardianSocket = s;
        if (roles[s.id] === 'civilian' && !targetSocket) targetSocket = s;
    }

    // Wait for night phase
    await new Promise((resolve) => {
        host.once('phase_changed', (data) => {
            if (data.phase === 'night') resolve();
        });
        setTimeout(() => resolve(), 12000);
    });
    await sleep(500);

    // Record initial timeRemaining (should be ~25s per Bug 4 fix)
    let initialTime = null;
    const roomUpdatePromise = new Promise((resolve) => {
        host.once('room_update', (data) => {
            initialTime = data.state.timeRemaining;
            resolve();
        });
    });
    // We might have already gotten the room_update. Check stored time
    // Let's just set up night_results listeners and time it
    const startTime = Date.now();

    // Set up night_results listener
    const nightResultPromise = waitForEvent(host, 'night_results', 30000);

    // Submit both votes simultaneously
    const [maphiaRes, guardianRes] = await Promise.all([
        emitWithCallback(maphiaSocket, 'submit_night_vote', { targetId: targetSocket.id }),
        emitWithCallback(guardianSocket, 'submit_guardian_save', { targetId: targetSocket.id }),
    ]);

    assert(maphiaRes.success === true, 'Maphia vote submitted simultaneously');
    assert(guardianRes.success === true, 'Guardian save submitted simultaneously');

    // Wait for night results — should resolve EARLY (well before 25s)
    const nightResult = await nightResultPromise;
    const elapsed = Date.now() - startTime;

    assert(elapsed < 5000, `Night resolved early in ${elapsed}ms (< 5s, not waiting for 25s timer)`);
    assert(nightResult !== undefined, 'night_results received after simultaneous voting');

    console.log(`  Night resolved in ${elapsed}ms after both votes submitted`);

    sockets.forEach(s => s.disconnect());
    console.log('  [cleanup] All Bug 4 sockets disconnected');
}

// ============================================================
// Bug 5: Joker + Maphia only → game should end (Maphia wins)
// ============================================================
async function testBug5() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BUG 5: Joker + Maphia only → Maphia should win');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // This test directly validates the checkWinCondition logic
    // We'll simulate the game state by using the server's actual GameRoom class
    // But since we can't import it directly, we'll test via Socket.io simulation

    const sockets = [];
    const host = createSocket();
    await waitForEvent(host, 'connect');
    sockets.push(host);

    const createRes = await emitWithCallback(host, 'create_room', {
        name: 'HostBug5',
        settings: { maxPlayers: 7, maphiaCount: 1 }
    });
    const roomCode = createRes.roomCode;

    for (let i = 0; i < 4; i++) {
        const s = createSocket();
        await waitForEvent(s, 'connect');
        await emitWithCallback(s, 'join_room', { roomCode, name: `B5P${i}` });
        sockets.push(s);
    }

    for (const s of sockets) {
        s.emit('set_ready', { isReady: true });
    }
    await sleep(500);

    // Collect roles
    const roles = {};
    const names = {};
    const rolePromises = sockets.map((s, i) => {
        return new Promise((resolve) => {
            s.once('role_assigned', (data) => {
                roles[s.id] = data.role;
                names[s.id] = i === 0 ? 'HostBug5' : `B5P${i - 1}`;
                resolve();
            });
        });
    });

    await emitWithCallback(host, 'start_game', {});
    await Promise.all(rolePromises);

    console.log('  Roles:');
    for (const [id, role] of Object.entries(roles)) {
        console.log(`    ${names[id]}: ${role}`);
    }

    // Find all role sockets
    let maphiaSocket = null;
    let guardianSocket = null;
    let jokerSocket = null;
    const civilianSockets = [];

    for (const s of sockets) {
        switch (roles[s.id]) {
            case 'maphia': maphiaSocket = s; break;
            case 'guardian': guardianSocket = s; break;
            case 'joker': jokerSocket = s; break;
            case 'civilian': civilianSockets.push(s); break;
        }
    }

    assert(maphiaSocket !== null, 'Found Maphia');
    assert(guardianSocket !== null, 'Found Guardian');
    assert(jokerSocket !== null, 'Found Joker');
    assert(civilianSockets.length > 0, `Found ${civilianSockets.length} civilian(s)`);

    // Strategy: Kill all non-Maphia non-Joker players through night kills
    // We need to kill: guardian + all civilians
    // The Maphia kills one per night round

    const playersToKill = [guardianSocket, ...civilianSockets];
    let gameOverReceived = false;
    let gameOverData = null;

    // Set up game_over listener on all sockets
    for (const s of sockets) {
        s.on('game_over', (data) => {
            gameOverReceived = true;
            gameOverData = data;
        });
    }

    for (let round = 0; round < playersToKill.length; round++) {
        if (gameOverReceived) break;

        const target = playersToKill[round];
        console.log(`  --- Round ${round + 1}: Maphia targets ${names[target.id]} (${roles[target.id]}) ---`);

        // Wait for night phase
        await new Promise((resolve) => {
            const handler = (data) => {
                if (data.phase === 'night') {
                    host.removeListener('phase_changed', handler);
                    resolve();
                }
            };
            host.on('phase_changed', handler);
            setTimeout(() => resolve(), 15000);
        });
        await sleep(300);

        if (gameOverReceived) break;

        // Maphia kills the target  
        const nightVoteRes = await emitWithCallback(maphiaSocket, 'submit_night_vote', {
            targetId: target.id,
        });

        // Guardian saves someone random (not self, not the target — or skip if guardian is dead)
        if (roles[guardianSocket.id] === 'guardian' && round === 0) {
            // Guardian is alive in round 0, save someone else (not the target)
            const saveTarget = jokerSocket.id; // Save joker instead
            try {
                await emitWithCallback(guardianSocket, 'submit_guardian_save', { targetId: saveTarget });
            } catch (e) {
                // Guardian may already be dead
            }
        }

        // Wait for night results
        try {
            await waitForEvent(host, 'night_results', 30000);
        } catch (e) {
            console.log(`  Warning: Timeout waiting for night_results in round ${round + 1}`);
        }

        console.log(`  Night ${round + 1} resolved`);

        if (gameOverReceived) {
            console.log(`  Game over detected after night ${round + 1}!`);
            break;
        }

        // If game continues, need to get through discussion + voting phases
        // Wait for discussion phase
        try {
            await new Promise((resolve) => {
                const handler = (data) => {
                    if (data.phase === 'discussion') {
                        host.removeListener('phase_changed', handler);
                        resolve();
                    }
                    if (data.phase === 'game_over') {
                        host.removeListener('phase_changed', handler);
                        resolve();
                    }
                };
                host.on('phase_changed', handler);
                setTimeout(() => resolve(), 15000);
            });
        } catch (e) { }

        if (gameOverReceived) break;

        // Wait for voting phase
        try {
            await new Promise((resolve) => {
                const handler = (data) => {
                    if (data.phase === 'voting') {
                        host.removeListener('phase_changed', handler);
                        resolve();
                    }
                };
                host.on('phase_changed', handler);
                setTimeout(() => resolve(), 120000); // Wait up to 2 min for discussion timer
            });
        } catch (e) { }

        if (gameOverReceived) break;

        await sleep(500);

        // All alive players skip vote so nobody gets eliminated
        for (const s of sockets) {
            if (!gameOverReceived) {
                try {
                    await emitWithCallback(s, 'submit_vote', { targetId: null }, 3000);
                } catch (e) { /* dead players can't vote */ }
            }
        }

        // Wait for results → next night
        await sleep(6000);

        if (gameOverReceived) break;
    }

    // Check if game ended
    if (gameOverReceived) {
        assert(gameOverData.winner === 'maphia', `Winner is Maphia (got: "${gameOverData.winner}")`);
        console.log('  Game over data:', JSON.stringify(gameOverData, null, 2));
    } else {
        // If game didn't end naturally through the rounds, wait a bit more
        await sleep(10000);
        assert(gameOverReceived, 'Game should have ended when only Joker + Maphia remain');
        if (gameOverData) {
            assert(gameOverData.winner === 'maphia', `Winner should be Maphia (got: "${gameOverData.winner}")`);
        }
    }

    sockets.forEach(s => s.disconnect());
    console.log('  [cleanup] All Bug 5 sockets disconnected');
}

// ============================================================
// Main runner
// ============================================================
async function main() {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   MAPHIA BETA BUG FIX TESTS                    ║');
    console.log('║   Testing Bugs 2, 3, 4, 5                      ║');
    console.log('║   (Bug 1 = manual test on device)               ║');
    console.log('╚══════════════════════════════════════════════════╝');

    try {
        await testBug2();
        await sleep(1000);

        await testBug3();
        await sleep(1000);

        await testBug4();
        await sleep(1000);

        await testBug5();
    } catch (error) {
        console.error('\n💥 Test execution error:', error.message);
        console.error(error.stack);
        failed++;
    }

    console.log('\n══════════════════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('══════════════════════════════════════════════════');

    if (failed > 0) {
        console.log('\n⚠️  Some tests FAILED. Review the output above.');
    } else {
        console.log('\n🎉 All tests PASSED!');
    }

    process.exit(failed > 0 ? 1 : 0);
}

main();
