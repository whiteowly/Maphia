import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
// Initialize Prisma
const prisma = new PrismaClient();
// Dev-only: ensure seed and expose endpoint when SEED=true
async function ensureDevSeed() {
    if (process.env.NODE_ENV === 'production')
        return null;
    if (process.env.SEED !== 'true')
        return null;
    try {
        // Upsert room/user similarly to seed
        const user = await prisma.user.upsert({
            where: { username: 'seed_user' },
            update: {},
            create: { username: 'seed_user', avatarUrl: null, gamesPlayed: 0, gamesWon: 0 },
        });
        const room = await prisma.room.upsert({
            where: { code: 'ABC123' },
            update: {},
            create: { code: 'ABC123', status: 'LOBBY', maxPlayers: 7, maphiaCount: 2, discussionTime: 2 },
        });
        const players = await prisma.player.findMany({ where: { roomId: room.id } });
        if (players.length < 2) {
            for (let i = players.length; i < 2; i++) {
                await prisma.player.create({ data: { userId: user.id, roomId: room.id, role: 'PENDING', isAlive: true, isReady: false } });
            }
        }
        return { roomCode: room.code };
    }
    catch (e) {
        console.error('Dev seed failed', e);
        return null;
    }
}
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);
    // --- JOIN LOGIC ---
    socket.on("JOIN_GAME", async (roomCode) => {
        try {
            // 1. Find room in PostgreSQL
            const room = await prisma.room.findUnique({
                where: { code: roomCode.toUpperCase() },
                include: { players: true }
            });
            if (!room) {
                return socket.emit("JOIN_ERROR", "Room not found");
            }
            if (room.status !== "LOBBY") {
                return socket.emit("JOIN_ERROR", "Game in progress");
            }
            // 2. Create player in DB (using socket.id as a temporary unique ID)
            const newPlayer = await prisma.player.create({
                data: {
                    roomId: room.id,
                    userId: socket.id, // Temporary: replace with real user ID later
                    isReady: false,
                }
            });
            // 3. Physically join the Socket.io room
            socket.join(roomCode.toUpperCase());
            // 4. Send success back to the user
            socket.emit("JOIN_SUCCESS", { code: room.code });
            // 5. Tell everyone in that room a new player is here
            io.to(roomCode.toUpperCase()).emit("PLAYER_JOINED", {
                id: newPlayer.id,
                username: `Player_${socket.id.substring(0, 4)}`
            });
            console.log(`Socket ${socket.id} joined room ${roomCode}`);
            try {
                fs.appendFileSync('join.log', `${new Date().toISOString()} JOIN ${socket.id} ${roomCode}\n`);
            }
            catch (e) {
                console.warn('Failed to write join.log', e);
            }
        }
        catch (e) {
            console.error("Join Error:", e);
            socket.emit("JOIN_ERROR", "Internal Server Error");
        }
    });
    // --- READY LOGIC ---
    socket.on("TOGGLE_READY", async (data) => {
        try {
            // Logic to toggle ready status would go here
            io.to(data.roomCode).emit("PLAYER_UPDATED", {
                id: data.playerId,
                status: "READY"
            });
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
    });
});
// Dev-only route to ensure seed and return seeded room code
app.get('/dev/seed', async (req, res) => {
    if (process.env.NODE_ENV === 'production')
        return res.status(403).send('Forbidden');
    const result = await ensureDevSeed();
    if (!result)
        return res.status(500).json({ ok: false });
    return res.json({ ok: true, roomCode: result.roomCode });
});
// Optionally auto-run seed at startup when SEED=true
if (process.env.SEED === 'true' && process.env.NODE_ENV !== 'production') {
    ensureDevSeed().then(r => console.log('Dev seed result:', r)).catch(e => console.error(e));
}
const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map