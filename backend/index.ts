import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { networkInterfaces } from 'os';

// Initialize Prisma
const prisma = new PrismaClient();

// Dev-only: ensure seed and expose endpoint when SEED=true
async function ensureDevSeed() {
  if (process.env.NODE_ENV === 'production') return null
  if (process.env.SEED !== 'true') return null
  try {
    // Upsert room/user similarly to seed
    const user = await prisma.user.upsert({
      where: { username: 'seed_user' },
      update: {},
      create: { username: 'seed_user', avatarUrl: null, gamesPlayed: 0, gamesWon: 0 },
    })

    const room = await prisma.room.upsert({
      where: { code: 'ABC123' },
      update: {},
      create: { code: 'ABC123', status: 'LOBBY', maxPlayers: 7, maphiaCount: 2, discussionTime: 2 },
    })

    const players = await prisma.player.findMany({ where: { roomId: room.id } })
    if (players.length < 2) {
      for (let i = players.length; i < 2; i++) {
        await prisma.player.create({ data: { userId: user.id, roomId: room.id, role: 'PENDING', isAlive: true, isReady: false } })
      }
    }

    return { roomCode: room.code }
  } catch (e) {
    console.error('Dev seed failed', e)
    return null
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
  socket.on("CREATE_LOBBY", async (data: { 
    username: string, 
    maxPlayers?: number, 
    maphiaCount?: number, 
    discussionTime?: number,
    votingTime?: number,
    customCode?: string
  }) => {
    console.log("SERVER: CREATE_LOBBY received from", socket.id, data);
    try {
      const { username, maxPlayers = 10, maphiaCount = 2, discussionTime = 60, votingTime = 30, customCode } = data;
      // 1. Upsert User
      const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: { username, avatarUrl: null, gamesPlayed: 0, gamesWon: 0 },
      });

      let room;
      if (customCode) {
        // Handle Local Room: Reset if exists
        const existingRoom = await prisma.room.findUnique({ where: { code: customCode } });
        if (existingRoom) {
          // Remove old players to reset the lobby
          await prisma.player.deleteMany({ where: { roomId: existingRoom.id } });
        }
        
        room = await prisma.room.upsert({
          where: { code: customCode },
          update: { status: 'LOBBY', maxPlayers, maphiaCount, discussionTime },
          create: { code: customCode, status: 'LOBBY', maxPlayers, maphiaCount, discussionTime },
        });
      } else {
        // Standard Random Room
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        room = await prisma.room.create({
          data: {
            code: roomCode,
            status: 'LOBBY',
            maxPlayers,
            maphiaCount,
            discussionTime,
          },
        });
      }

      // 4. Create Host Player
      await prisma.player.create({
        data: {
          userId: user.id,
          roomId: room.id,
          role: 'PENDING',
          isAlive: true,
          isReady: true,
        },
      });

      socket.join(room.code);
      socket.emit("LOBBY_CREATED", { roomCode: room.code, userId: user.id });
    } catch (e) {
      console.error("Create lobby error:", e);
      socket.emit("ERROR", "Failed to create lobby");
    }
  });

  socket.on("GET_LOBBY_PLAYERS", async (roomCode) => {
    try {
      const room = await prisma.room.findUnique({
        where: { code: roomCode.toUpperCase() },
        include: { 
          players: {
            include: { user: true }
          } 
        }
      });
      if (room) {
        socket.emit("ROOM_PLAYERS", room.players);
      }
    } catch (e) {
      console.error("Lobby fetch error:", e);
    }
  });

  socket.on("JOIN_GAME", async (data: { roomCode: string, username: string }) => {
    try {
      const { roomCode, username } = data;
      const code = roomCode.toUpperCase();
      
      const room = await prisma.room.findUnique({
        where: { code },
      });

      if (!room) {
        socket.emit("JOIN_ERROR", "Room not found");
        return;
      }

      // Upsert User
      const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: { username, avatarUrl: null, gamesPlayed: 0, gamesWon: 0 },
      });

      // Check if player already in room
      const existingPlayer = await prisma.player.findFirst({
        where: { roomId: room.id, userId: user.id }
      });

      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            userId: user.id,
            roomId: room.id,
            role: 'PENDING',
            isAlive: true,
            isReady: false,
          }
        });
      }

      socket.join(code);
      socket.emit("JOIN_SUCCESS", { code: room.code, userId: user.id });
      
      // Notify others
      const updatedRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: { players: { include: { user: true } } }
      });
      if (updatedRoom) {
        io.to(code).emit("ROOM_PLAYERS", updatedRoom.players);
      }

    } catch (e) {
      console.error("Join game error:", e);
      socket.emit("JOIN_ERROR", "Internal server error");
    }
  });

  // --- READY LOGIC ---
  socket.on("TOGGLE_READY", async (data: { roomCode: string, userId: any }) => {
    try {
      const { roomCode, userId } = data;
      const room = await prisma.room.findUnique({ where: { code: roomCode }, include: { players: true } });
      if (!room) return;
      
      const player = room.players.find(p => p.userId === userId);
      if (player) {
        await prisma.player.update({
          where: { id: player.id },
          data: { isReady: !player.isReady }
        });
        
        const updatedRoom = await prisma.room.findUnique({
          where: { id: room.id },
          include: { players: { include: { user: true } } }
        });
        io.to(roomCode).emit("ROOM_PLAYERS", updatedRoom?.players);
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("START_GAME", async (data: { roomCode: string }) => {
    try {
      const { roomCode } = data;
      const room = await prisma.room.findUnique({ where: { code: roomCode }, include: { players: true } });
      if (!room) return;

      // 1. Assign Roles
      const players = [...room.players];
      // Shuffle
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }

      // Update DB
      for (let i = 0; i < players.length; i++) {
        const role = i < room.maphiaCount ? 'MAPHIA' : 'CIVILIAN';
        await prisma.player.update({
          where: { id: players[i].id },
          data: { role }
        });
      }

      // 2. Notify Room
      const startedRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: { players: { include: { user: true } } }
      });
      
      io.to(roomCode).emit("GAME_STARTED", startedRoom?.players);

    } catch (e) {
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

// Dev-only route to ensure seed and return seeded room code
app.get('/dev/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).send('Forbidden')
  const result = await ensureDevSeed()
  if (!result) return res.status(500).json({ ok: false })
  return res.json({ ok: true, roomCode: result.roomCode })
})

// Optionally auto-run seed at startup when SEED=true
if (process.env.SEED === 'true' && process.env.NODE_ENV !== 'production') {
  ensureDevSeed().then(r => console.log('Dev seed result:', r)).catch(e => console.error(e))
}

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("------------------------------------------------");
  console.log("To connect from your phone, use one of these IPs:");
  
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const interfaces = nets[name];
    if (interfaces) {
      for (const net of interfaces) {
        // Skip internal (localhost) and non-IPv4
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`  [${name}]: http://${net.address}:${PORT}`);
        }
      }
    }
  }
  console.log("------------------------------------------------");
});