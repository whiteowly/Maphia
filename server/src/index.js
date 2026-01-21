const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // In production, restrict this to your app's domain
        methods: ['GET', 'POST'],
    },
});

// In-memory storage for game rooms
// Structure: { roomCode: GameRoom }
const rooms = new Map();

// Game room class
class GameRoom {
    constructor(roomCode, hostId, settings) {
        this.roomCode = roomCode;
        this.hostId = hostId;
        this.settings = {
            maxPlayers: settings.maxPlayers || 7,
            maphiaCount: settings.maphiaCount || 2,
            discussionTimeSeconds: settings.discussionTimeSeconds || 60,
            votingTimeSeconds: settings.votingTimeSeconds || 30,
        };
        this.players = new Map(); // playerId -> Player
        this.phase = 'lobby'; // lobby, role_reveal, night, guardian, discussion, voting, results, game_over
        this.currentRound = 1;
        this.votes = new Map(); // playerId -> votedForPlayerId
        this.nightVotes = new Map(); // Maphia playerId -> targetPlayerId (night kills)
        this.guardianSave = null; // playerId that Guardian saves
        this.timerInterval = null;
        this.timeRemaining = 0;
    }

    addPlayer(playerId, name, isHost = false) {
        if (this.players.size >= this.settings.maxPlayers) {
            return { success: false, error: 'Room is full' };
        }

        this.players.set(playerId, {
            id: playerId,
            name: name,
            isHost: isHost,
            isReady: isHost, // Host is automatically ready
            isDead: false,
            role: null,
            isMuted: false,
        });

        return { success: true };
    }

    removePlayer(playerId) {
        this.players.delete(playerId);

        // If host left, assign new host
        if (this.hostId === playerId && this.players.size > 0) {
            const newHost = this.players.values().next().value;
            newHost.isHost = true;
            this.hostId = newHost.id;
        }

        return this.players.size;
    }

    setPlayerReady(playerId, isReady) {
        const player = this.players.get(playerId);
        if (player) {
            player.isReady = isReady;
        }
    }

    allPlayersReady() {
        for (const player of this.players.values()) {
            if (!player.isReady) return false;
        }
        return this.players.size >= 5; // Minimum 5 players
    }

    assignRoles() {
        const playerIds = Array.from(this.players.keys());
        const totalPlayers = playerIds.length;

        // Shuffle players
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }

        // Validate and use host-selected Maphia count with range limits
        let maphiaCount = this.settings.maphiaCount;

        // Enforce range limits based on player count
        if (totalPlayers <= 6) {
            maphiaCount = Math.min(maphiaCount, 1); // Max 1 Maphia for ≤6 players
        } else if (totalPlayers <= 9) {
            maphiaCount = Math.min(Math.max(maphiaCount, 1), 2); // 1-2 Maphias for 7-9 players
        } else {
            maphiaCount = Math.min(Math.max(maphiaCount, 1), 3); // 1-3 Maphias for 10+ players
        }

        let guardianIndex = maphiaCount;
        let jokerIndex = maphiaCount + 1;

        // Assign roles: Maphia, Guardian Angel, Joker, then Civilians
        playerIds.forEach((id, index) => {
            const player = this.players.get(id);

            if (index < maphiaCount) {
                player.role = 'maphia';
            } else if (index === guardianIndex) {
                player.role = 'guardian';
            } else if (index === jokerIndex) {
                player.role = 'joker';
                player.jokerSaveAvailable = true; // One-time save from night kill
            } else {
                player.role = 'civilian';
            }
        });
    }

    getPlayerRole(playerId) {
        const player = this.players.get(playerId);
        return player ? player.role : null;
    }

    getMaphiaTeammates(playerId) {
        const player = this.players.get(playerId);
        if (!player || player.role !== 'maphia') return [];

        const teammates = [];
        for (const [id, p] of this.players) {
            if (id !== playerId && p.role === 'maphia' && !p.isDead) {
                teammates.push({ id: p.id, name: p.name });
            }
        }
        return teammates;
    }

    submitVote(voterId, targetId) {
        if (this.phase !== 'voting') return false;

        const voter = this.players.get(voterId);
        if (!voter || voter.isDead) return false;

        this.votes.set(voterId, targetId);
        return true;
    }

    tallyVotes() {
        const voteCounts = new Map();

        for (const targetId of this.votes.values()) {
            if (targetId) {
                voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
            }
        }

        // Find player with most votes
        let maxVotes = 0;
        let eliminated = null;
        let tie = false;

        for (const [playerId, count] of voteCounts) {
            if (count > maxVotes) {
                maxVotes = count;
                eliminated = playerId;
                tie = false;
            } else if (count === maxVotes) {
                tie = true;
            }
        }

        // If tie, no one is eliminated
        if (tie) {
            return { eliminated: null, tie: true, voteCounts: Object.fromEntries(voteCounts) };
        }

        // Eliminate player
        if (eliminated) {
            const player = this.players.get(eliminated);
            if (player) {
                player.isDead = true;
            }
        }

        return {
            eliminated: eliminated,
            tie: false,
            voteCounts: Object.fromEntries(voteCounts),
            eliminatedRole: eliminated ? this.players.get(eliminated)?.role : null,
        };
    }

    checkWinCondition() {
        let aliveMaphias = 0;
        let aliveNonMaphias = 0;
        let aliveJokers = 0;

        for (const player of this.players.values()) {
            if (!player.isDead) {
                if (player.role === 'maphia') {
                    aliveMaphias++;
                } else {
                    aliveNonMaphias++;
                    if (player.role === 'joker') {
                        aliveJokers++;
                    }
                }
            }
        }

        // Maphia wins if they equal or outnumber non-maphias
        // This includes 1v1 mafia vs joker (1 >= 1)
        if (aliveMaphias > 0 && aliveMaphias >= aliveNonMaphias) {
            return { gameOver: true, winner: 'maphia' };
        }

        // Civilians win if all Maphia dead
        if (aliveMaphias === 0) {
            return { gameOver: true, winner: 'civilians' };
        }

        return { gameOver: false, winner: null };
    }

    getPublicPlayerList() {
        const players = [];
        for (const [id, player] of this.players) {
            players.push({
                id: player.id,
                name: player.name,
                isHost: player.isHost,
                isReady: player.isReady,
                isDead: player.isDead,
                isMuted: player.isMuted,
                // Don't expose role to everyone
            });
        }
        return players;
    }

    getState() {
        return {
            roomCode: this.roomCode,
            hostId: this.hostId,
            settings: this.settings,
            phase: this.phase,
            currentRound: this.currentRound,
            timeRemaining: this.timeRemaining,
            playerCount: this.players.size,
        };
    }

    clearVotes() {
        this.votes.clear();
    }

    // Reset game state for play again
    resetGame() {
        this.phase = 'lobby';
        this.currentRound = 0;
        this.timeRemaining = 0;
        this.votes.clear();
        this.nightVotes.clear();
        this.guardianSave = null;

        // Clear timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reset player state but keep them in the room
        for (const player of this.players.values()) {
            player.isDead = false;
            player.role = null;
            player.isReady = player.id === this.hostId; // Host stays ready
            player.isMuted = false;
        }
    }
}

// Generate unique room code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(code));
    return code;
}

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    let currentRoom = null;
    let playerId = socket.id;
    let playerName = 'Player';

    // Create a new room
    socket.on('create_room', (data, callback) => {
        const { name, settings } = data;
        playerName = name || 'Host';

        const roomCode = generateRoomCode();
        const room = new GameRoom(roomCode, playerId, settings);
        room.addPlayer(playerId, playerName, true);

        rooms.set(roomCode, room);
        socket.join(roomCode);
        currentRoom = roomCode;

        console.log(`Room created: ${roomCode} by ${playerName}`);

        callback({
            success: true,
            roomCode: roomCode,
            playerId: playerId,
            isHost: true,
        });

        // Emit initial state
        io.to(roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });
    });

    // Join an existing room
    socket.on('join_room', (data, callback) => {
        const { roomCode, name } = data;
        playerName = name || 'Player';

        const room = rooms.get(roomCode);

        if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
        }

        if (room.phase !== 'lobby') {
            callback({ success: false, error: 'Game already in progress' });
            return;
        }

        const result = room.addPlayer(playerId, playerName, false);

        if (!result.success) {
            callback(result);
            return;
        }

        socket.join(roomCode);
        currentRoom = roomCode;

        console.log(`${playerName} joined room: ${roomCode}`);

        callback({
            success: true,
            roomCode: roomCode,
            playerId: playerId,
            isHost: false,
        });

        // Notify everyone in the room
        io.to(roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });

        io.to(roomCode).emit('player_joined', {
            playerId: playerId,
            name: playerName,
        });
    });

    // Set ready status
    socket.on('set_ready', (data) => {
        const { isReady } = data;
        const room = rooms.get(currentRoom);

        if (!room) return;

        room.setPlayerReady(playerId, isReady);

        io.to(currentRoom).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });
    });

    // Start the game (host only)
    socket.on('start_game', (data, callback) => {
        const room = rooms.get(currentRoom);

        if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
        }

        if (room.hostId !== playerId) {
            callback({ success: false, error: 'Only host can start the game' });
            return;
        }

        if (room.players.size < 5) {
            callback({ success: false, error: 'Need at least 5 players to start' });
            return;
        }

        // Assign roles
        room.assignRoles();
        room.phase = 'role_reveal';

        callback({ success: true });

        // Send role to each player individually
        for (const [pid, player] of room.players) {
            const socketId = pid;
            io.to(socketId).emit('role_assigned', {
                role: player.role,
                teammates: player.role === 'maphia' ? room.getMaphiaTeammates(pid) : [],
            });
        }

        io.to(currentRoom).emit('game_started', {
            phase: 'role_reveal',
        });

        // After 10 seconds, start night phase
        setTimeout(() => {
            if (room.phase === 'role_reveal') {
                startNightPhase(room);
            }
        }, 10000);
    });

    // Ready to continue after role reveal
    socket.on('continue_from_reveal', () => {
        const room = rooms.get(currentRoom);
        if (!room) return;

        // Start night phase immediately if triggered
        if (room.phase === 'role_reveal') {
            startNightPhase(room);
        }
    });

    // Submit a vote
    socket.on('submit_vote', (data, callback) => {
        const { targetId } = data;
        const room = rooms.get(currentRoom);

        if (!room) {
            callback({ success: false, error: 'Room not found' });
            return;
        }

        const success = room.submitVote(playerId, targetId);
        callback({ success });

        // Notify everyone about vote count AND who voted for whom
        const targetPlayer = targetId ? room.players.get(targetId) : null;
        io.to(currentRoom).emit('vote_submitted', {
            voterId: playerId,
            voterName: room.players.get(playerId)?.name,
            targetId: targetId,
            targetName: targetPlayer?.name || 'Skip',
            totalVotes: room.votes.size,
            totalVoters: Array.from(room.players.values()).filter(p => !p.isDead).length,
        });
    });

    // Submit a night vote (Maphia only)
    socket.on('submit_night_vote', (data, callback) => {
        const { targetId } = data;
        const room = rooms.get(currentRoom);

        if (!room || room.phase !== 'night') {
            callback({ success: false, error: 'Invalid phase' });
            return;
        }

        const player = room.players.get(playerId);
        if (!player || player.role !== 'maphia') {
            callback({ success: false, error: 'Only Maphia can kill' });
            return;
        }

        room.nightVotes.set(playerId, targetId);
        callback({ success: true });

        // Check if all Maphias voted
        const aliveMaphias = Array.from(room.players.values())
            .filter(p => p.role === 'maphia' && !p.isDead);

        if (room.nightVotes.size >= aliveMaphias.length) {
            clearInterval(room.timerInterval);
            startGuardianPhase(room); // Go to guardian phase
        }
    });

    // Submit guardian save (Guardian only)
    socket.on('submit_guardian_save', (data, callback) => {
        const { targetId } = data;
        const room = rooms.get(currentRoom);

        if (!room || room.phase !== 'guardian') {
            callback({ success: false, error: 'Invalid phase' });
            return;
        }

        const player = room.players.get(playerId);
        if (!player || player.role !== 'guardian') {
            callback({ success: false, error: 'Only Guardian can save' });
            return;
        }

        // Can't save self
        if (targetId === playerId) {
            callback({ success: false, error: "You can't save yourself" });
            return;
        }

        room.guardianSave = targetId;
        callback({ success: true });

        // Immediately resolve night - clear timer first
        console.log(`[DEBUG] Guardian submitted save for room ${room.roomCode}, clearing timer and resolving night`);
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = null;
        }
        resolveNightPhase(room);
    });

    // Toggle mute
    socket.on('toggle_mute', (data) => {
        const { isMuted } = data;
        const room = rooms.get(currentRoom);

        if (!room) return;

        const player = room.players.get(playerId);
        if (player) {
            player.isMuted = isMuted;
        }

        io.to(currentRoom).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);

        if (currentRoom) {
            const room = rooms.get(currentRoom);

            if (room) {
                const remainingPlayers = room.removePlayer(playerId);

                if (remainingPlayers === 0) {
                    // Room is empty, delete it
                    if (room.timerInterval) {
                        clearInterval(room.timerInterval);
                    }
                    rooms.delete(currentRoom);
                    console.log(`Room deleted: ${currentRoom}`);
                } else {
                    // Notify remaining players
                    io.to(currentRoom).emit('player_left', {
                        playerId: playerId,
                        name: playerName,
                        newHostId: room.hostId,
                    });

                    io.to(currentRoom).emit('room_update', {
                        state: room.getState(),
                        players: room.getPublicPlayerList(),
                    });
                }
            }
        }
    });

    // Helper function to start night phase
    function startNightPhase(room) {
        room.phase = 'night';
        room.nightVotes.clear();
        room.guardianSave = null;
        room.timeRemaining = 20; // 20 seconds for night

        io.to(room.roomCode).emit('phase_changed', {
            phase: 'night',
            timeRemaining: room.timeRemaining
        });

        io.to(room.roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList()
        });

        // Start timer
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
        }

        room.timerInterval = setInterval(() => {
            room.timeRemaining--;

            io.to(room.roomCode).emit('timer_update', {
                timeRemaining: room.timeRemaining
            });

            if (room.timeRemaining <= 0) {
                clearInterval(room.timerInterval);
                startGuardianPhase(room);
            }
        }, 1000);
    }

    // Helper function to start guardian phase (or skip if guardian is dead)
    function startGuardianPhase(room) {
        // Guard: Don't restart guardian phase if already past night phase
        if (room.phase !== 'night') {
            console.log(`[DEBUG] Skipping startGuardianPhase - already in phase ${room.phase}`);
            return;
        }

        // Bug 4 Fix: Check if guardian is still alive
        const guardian = Array.from(room.players.values()).find(p => p.role === 'guardian');
        if (!guardian || guardian.isDead) {
            console.log(`[DEBUG] Guardian is dead or doesn't exist, skipping to resolve phase`);
            room.phase = 'guardian'; // Set phase so resolveNightPhase guard passes
            resolveNightPhase(room);
            return;
        }

        console.log(`[DEBUG] Starting guardian phase for room ${room.roomCode}`);
        room.phase = 'guardian';
        room.timeRemaining = 15; // 15 seconds for guardian

        io.to(room.roomCode).emit('phase_changed', {
            phase: 'guardian',
            timeRemaining: room.timeRemaining
        });

        io.to(room.roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList()
        });

        // Start timer
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
        }

        room.timerInterval = setInterval(() => {
            room.timeRemaining--;

            io.to(room.roomCode).emit('timer_update', {
                timeRemaining: room.timeRemaining
            });

            if (room.timeRemaining <= 0) {
                console.log(`[DEBUG] Guardian timer ended for room ${room.roomCode}, calling resolveNightPhase`);
                clearInterval(room.timerInterval);
                room.timerInterval = null;
                resolveNightPhase(room);
            }
        }, 1000);
    }

    // Resolve night: Determine who dies (Maphia kill vs Guardian/Joker saves)
    function resolveNightPhase(room) {
        // Guard: Only run if in guardian phase
        if (room.phase !== 'guardian') {
            console.log(`[DEBUG] Skipping resolveNightPhase - already in phase ${room.phase}`);
            return;
        }

        console.log(`[DEBUG] resolveNightPhase called for room ${room.roomCode}`);
        room.phase = 'night_results'; // Set to intermediate phase to prevent duplicate calls

        try {
            // Tally Maphia votes
            const voteCounts = new Map();

            for (const targetId of room.nightVotes.values()) {
                if (targetId) {
                    voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
                }
            }

            console.log(`[DEBUG] Night votes count: ${voteCounts.size}, nightVotes.size: ${room.nightVotes.size}`);

            if (voteCounts.size === 0) {
                // No one voted
                console.log(`[DEBUG] No votes cast, emitting results with no kill`);
                emitNightResults(room, null, null, false, null);
                return;
            }

            // Find max votes
            let maxVotes = 0;
            for (const count of voteCounts.values()) {
                if (count > maxVotes) maxVotes = count;
            }

            // Get all players with max votes (for RNG tie-breaking)
            const tiedPlayers = [];
            for (const [playerId, count] of voteCounts) {
                if (count === maxVotes) {
                    tiedPlayers.push(playerId);
                }
            }

            // RNG if tie
            const targetedPlayer = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
            const target = room.players.get(targetedPlayer);

            console.log(`[DEBUG] Target selected: ${targetedPlayer}, guardianSave: ${room.guardianSave}`);

            // Check if Guardian Angel saved them
            if (room.guardianSave === targetedPlayer) {
                // Did Guardian save a Maphia?
                if (target?.role === 'maphia') {
                    // GUARDIAN DIES for saving Maphia!
                    const guardian = Array.from(room.players.values()).find(p => p.role === 'guardian');
                    if (guardian) {
                        guardian.isDead = true;
                    }

                    console.log(`[DEBUG] Guardian made a mistake - saved Maphia`);
                    emitNightResults(room, guardian?.id, targetedPlayer, false, 'guardian_mistake');
                    return;
                }

                // Guardian saved civilian/joker correctly
                console.log(`[DEBUG] Guardian saved the target successfully`);
                emitNightResults(room, null, targetedPlayer, true, null);
                return;
            }

            // Check if target is Joker with save available
            if (target?.role === 'joker' && target.jokerSaveAvailable) {
                // Joker uses their save automatically (but keep it SECRET!)
                target.jokerSaveAvailable = false;

                // Don't reveal it was Joker! Just say "saved"
                console.log(`[DEBUG] Joker used their secret save`);
                emitNightResults(room, null, targetedPlayer, true, null); // Same message as Guardian save
                return;
            }

            // Player dies
            console.log(`[DEBUG] Player ${targetedPlayer} dies`);
            target.isDead = true;
            emitNightResults(room, targetedPlayer, targetedPlayer, false, null);
        } catch (error) {
            console.error(`[ERROR] resolveNightPhase failed for room ${room.roomCode}:`, error);
            // Try to recover by moving to discussion anyway
            emitNightResults(room, null, null, false, null);
        }
    }

    function emitNightResults(room, killed, targeted, saved, specialCase) {
        console.log(`[DEBUG] emitNightResults for room ${room.roomCode}: killed=${killed}, targeted=${targeted}, saved=${saved}, specialCase=${specialCase}`);

        // Get guardian save info for display (Bug 3)
        const guardianSavedPlayer = room.guardianSave ? room.players.get(room.guardianSave) : null;

        io.to(room.roomCode).emit('night_results', {
            killed,
            killedName: killed ? room.players.get(killed)?.name : null,
            targeted,
            targetedName: targeted ? room.players.get(targeted)?.name : null,
            saved,
            guardianMistake: specialCase === 'guardian_mistake',
            // Bug 3: Include who guardian tried to save
            guardianSavedId: room.guardianSave,
            guardianSavedName: guardianSavedPlayer?.name || null,
        });

        console.log(`[DEBUG] Scheduling discussion phase in 5 seconds for room ${room.roomCode}`);
        setTimeout(() => {
            console.log(`[DEBUG] Starting discussion phase for room ${room.roomCode}`);
            startDiscussionPhase(room);
        }, 5000);
    }

    // Helper function to start discussion phase
    function startDiscussionPhase(room) {
        room.phase = 'discussion';
        room.timeRemaining = room.settings.discussionTimeSeconds;
        room.clearVotes();

        io.to(room.roomCode).emit('phase_changed', {
            phase: 'discussion',
            timeRemaining: room.timeRemaining,
        });

        // Send room update so discussion screen has updated player list (including deaths)
        io.to(room.roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });

        // Start timer
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
        }

        room.timerInterval = setInterval(() => {
            room.timeRemaining--;

            io.to(room.roomCode).emit('timer_update', {
                timeRemaining: room.timeRemaining,
            });

            if (room.timeRemaining <= 0) {
                clearInterval(room.timerInterval);
                startVotingPhase(room);
            }
        }, 1000);
    }

    // Helper function to start voting phase
    function startVotingPhase(room) {
        room.phase = 'voting';
        room.timeRemaining = room.settings.votingTimeSeconds;

        io.to(room.roomCode).emit('phase_changed', {
            phase: 'voting',
            timeRemaining: room.timeRemaining,
        });

        // Send room update so voting screen has player list
        io.to(room.roomCode).emit('room_update', {
            state: room.getState(),
            players: room.getPublicPlayerList(),
        });

        // Start timer
        if (room.timerInterval) {
            clearInterval(room.timerInterval);
        }

        room.timerInterval = setInterval(() => {
            room.timeRemaining--;

            io.to(room.roomCode).emit('timer_update', {
                timeRemaining: room.timeRemaining,
            });

            if (room.timeRemaining <= 0) {
                clearInterval(room.timerInterval);
                endVotingPhase(room);
            }
        }, 1000);
    }

    // Helper function to end voting phase
    function endVotingPhase(room) {
        room.phase = 'results';

        const result = room.tallyVotes();

        // Check if eliminated player is Joker
        if (result.eliminated) {
            const eliminatedPlayer = room.players.get(result.eliminated);

            if (eliminatedPlayer?.role === 'joker') {
                // JOKER WINS!
                eliminatedPlayer.isDead = true;
                room.phase = 'game_over';

                // Reveal all roles
                const allRoles = {};
                for (const [id, player] of room.players) {
                    allRoles[id] = { name: player.name, role: player.role, isDead: player.isDead };
                }

                io.to(room.roomCode).emit('game_over', {
                    winner: 'joker',
                    jokerId: result.eliminated,
                    jokerName: eliminatedPlayer.name,
                    allRoles: allRoles
                });
                return;
            }

            // Normal elimination
            eliminatedPlayer.isDead = true;
        }

        io.to(room.roomCode).emit('voting_results', {
            eliminated: result.eliminated,
            eliminatedName: result.eliminated ? room.players.get(result.eliminated)?.name : null,
            eliminatedRole: result.eliminatedRole,
            tie: result.tie,
            voteCounts: result.voteCounts,
        });

        // Check win condition
        const winCheck = room.checkWinCondition();

        if (winCheck.gameOver) {
            room.phase = 'game_over';

            // Reveal all roles at game end
            const allRoles = {};
            for (const [id, player] of room.players) {
                allRoles[id] = { name: player.name, role: player.role, isDead: player.isDead };
            }

            io.to(room.roomCode).emit('game_over', {
                winner: winCheck.winner,
                allRoles: allRoles,
            });
        } else {
            // Continue to next round - START NIGHT PHASE
            setTimeout(() => {
                room.currentRound++;
                startNightPhase(room); // NEW: Go to night phase instead of discussion
            }, 5000);
        }
    }

    // Play again - host only
    socket.on('play_again', () => {
        const room = rooms.get(currentRoom);
        if (!room) return;

        // Only host can trigger play again
        if (room.hostId !== playerId) {
            socket.emit('waiting_for_host');
            return;
        }

        // Reset game state
        room.resetGame();

        // Notify all players to return to lobby
        io.to(room.roomCode).emit('return_to_lobby');

        // Send updated room state
        io.to(room.roomCode).emit('room_update', {
            roomCode: room.roomCode,
            players: Array.from(room.players.values()).map(p => ({
                id: p.id,
                name: p.name,
                isHost: p.id === room.hostId,
            })),
            settings: room.settings,
            phase: room.phase,
        });
    });

    // Non-host requesting to play again
    socket.on('request_play_again', () => {
        socket.emit('waiting_for_host');
    });

    // Handle disconnect - check if host left
    socket.on('disconnect', () => {
        console.log('Player disconnected:', playerId);

        const room = rooms.get(currentRoom);
        if (!room) return;

        const wasHost = room.hostId === playerId;

        // Remove player from room
        room.removePlayer(playerId);

        if (wasHost) {
            // Host left - notify all players and close room
            io.to(room.roomCode).emit('host_left');
            rooms.delete(currentRoom);
        } else if (room.players.size === 0) {
            // No players left - delete room
            rooms.delete(currentRoom);
        } else {
            // Notify remaining players
            io.to(room.roomCode).emit('room_update', {
                roomCode: room.roomCode,
                players: Array.from(room.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    isHost: p.id === room.hostId,
                })),
                settings: room.settings,
                phase: room.phase,
            });
        }
    });
}); // End of io.on('connection')

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Maphia Game Server',
        activeRooms: rooms.size,
    });
});

// List active rooms (for debugging)
app.get('/rooms', (req, res) => {
    const roomList = [];
    for (const [code, room] of rooms) {
        roomList.push({
            roomCode: code,
            playerCount: room.players.size,
            phase: room.phase,
        });
    }
    res.json(roomList);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🎮 Maphia Server running on port ${PORT}`);
});
