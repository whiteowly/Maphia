/**
 * Quick test for the chat feature
 */
const { io } = require('socket.io-client');
const SERVER_URL = 'http://localhost:3001';

function createSocket() {
    return io(SERVER_URL, { transports: ['polling', 'websocket'], timeout: 10000 });
}

function waitForEvent(socket, event, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${event}`)), timeout);
        socket.once(event, (data) => { clearTimeout(timer); resolve(data); });
    });
}

function emitCb(socket, event, data, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${event}`)), timeout);
        socket.emit(event, data, (res) => { clearTimeout(timer); resolve(res); });
    });
}

let passed = 0, failed = 0;
function assert(cond, msg) {
    if (cond) { console.log(`  ✅ ${msg}`); passed++; }
    else { console.log(`  ❌ ${msg}`); failed++; }
}

async function main() {
    console.log('\n=== CHAT FEATURE TESTS ===\n');

    // Create room with 2 players
    const host = createSocket();
    await waitForEvent(host, 'connect');
    const createRes = await emitCb(host, 'create_room', { name: 'Host', settings: { maxPlayers: 7 } });
    const roomCode = createRes.roomCode;
    assert(createRes.success, `Room created: ${roomCode}`);

    const p2 = createSocket();
    await waitForEvent(p2, 'connect');
    const joinRes = await emitCb(p2, 'join_room', { roomCode, name: 'Player2' });
    assert(joinRes.success, 'Player2 joined');

    // Test 1: Free text message in lobby
    console.log('\n--- Test 1: Free text in lobby ---');
    const msgPromise = waitForEvent(p2, 'chat_message');
    const sendRes = await emitCb(host, 'send_message', { text: 'Hello everyone!', isPreset: false, presetId: null });
    assert(sendRes.success, 'Free text sent successfully');

    const received = await msgPromise;
    assert(received.senderName === 'Host', `Sender is "Host" (got: "${received.senderName}")`);
    assert(received.text === 'Hello everyone!', `Text is "Hello everyone!" (got: "${received.text}")`);
    assert(received.isPreset === false, 'isPreset is false');
    assert(received.timestamp > 0, 'Has timestamp');

    // Test 2: Preset message
    console.log('\n--- Test 2: Preset message ---');
    await new Promise(r => setTimeout(r, 1100)); // Wait for rate limit
    const presetPromise = waitForEvent(host, 'chat_message');
    const presetRes = await emitCb(p2, 'send_message', { text: null, isPreset: true, presetId: 'acc_1' });
    assert(presetRes.success, 'Preset message sent');

    const presetReceived = await presetPromise;
    assert(presetReceived.senderName === 'Player2', `Sender is "Player2"`);
    assert(presetReceived.isPreset === true, 'isPreset is true');
    assert(presetReceived.presetId === 'acc_1', `presetId is "acc_1"`);

    // Test 3: Rate limiting
    console.log('\n--- Test 3: Rate limiting ---');
    const rateRes = await emitCb(p2, 'send_message', { text: 'spam', isPreset: false, presetId: null });
    assert(rateRes.success === false, 'Rate limited (sent too fast)');
    assert(rateRes.error.includes('Slow down'), `Error says "Slow down" (got: "${rateRes.error}")`);

    // Test 4: Empty message rejected
    console.log('\n--- Test 4: Validation ---');
    await new Promise(r => setTimeout(r, 1100));
    const emptyRes = await emitCb(host, 'send_message', { text: '   ', isPreset: false, presetId: null });
    assert(emptyRes.success === false, 'Empty message rejected');

    // Test 5: Long message rejected
    await new Promise(r => setTimeout(r, 1100));
    const longRes = await emitCb(host, 'send_message', { text: 'a'.repeat(201), isPreset: false, presetId: null });
    assert(longRes.success === false, 'Too-long message rejected');

    // Test 6: Invalid phase (start game, go to role_reveal)
    // We need 5 players for this - skip this test for now since it needs more setup

    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    if (failed === 0) console.log('🎉 All chat tests PASSED!');
    else console.log('⚠️ Some tests failed');

    host.disconnect();
    p2.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
