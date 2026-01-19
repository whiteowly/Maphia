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
        this.phase = 'lobby'; // lobby, role_reveal, discussion, voting, results, game_over
        this.currentRound = 1;
        this.votes = new Map(); // playerId -> votedForPlayerId
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

        // Shuffle players
        for (let i = playerIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
        }

        // Assign maphia roles to first N players
        const maphiaCount = Math.min(this.settings.maphiaCount, Math.floor(playerIds.length / 2));

        playerIds.forEach((id, index) => {
            const player = this.players.get(id);
            player.role = index < maphiaCount ? 'maphia' : 'civilian';
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
        let aliveCivilians = 0;

        for (const player of this.players.values()) {
            if (!player.isDead) {
                if (player.role === 'maphia') aliveMaphias++;
                else aliveCivilians++;
            }
        }

        if (aliveMaphias === 0) {
            return { gameOver: true, winner: 'civilians' };
        }

        if (aliveMaphias >= aliveCivilians) {
            return { gameOver: true, winner: 'maphia' };
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

        // After 5 seconds, start discussion phase
        setTimeout(() => {
            if (room.phase === 'role_reveal') {
                startDiscussionPhase(room);
            }
        }, 5000);
    });

    // Ready to continue after role reveal
    socket.on('continue_from_reveal', () => {
        const room = rooms.get(currentRoom);
        if (!room) return;

        // Start discussion immediately if triggered
        if (room.phase === 'role_reveal') {
            startDiscussionPhase(room);
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

        // Notify everyone about vote count (not who voted for whom)
        io.to(currentRoom).emit('vote_submitted', {
            voterId: playerId,
            totalVotes: room.votes.size,
            totalVoters: Array.from(room.players.values()).filter(p => !p.isDead).length,
        });
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

    // Helper function to start discussion phase
    function startDiscussionPhase(room) {
        room.phase = 'discussion';
        room.timeRemaining = room.settings.discussionTimeSeconds;
        room.clearVotes();

        io.to(room.roomCode).emit('phase_changed', {
            phase: 'discussion',
            timeRemaining: room.timeRemaining,
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
            // Continue to next round after delay
            setTimeout(() => {
                room.currentRound++;
                startDiscussionPhase(room);
            }, 5000);
        }
    }
});

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
