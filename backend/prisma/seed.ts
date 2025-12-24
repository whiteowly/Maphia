import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function runSeed() {
  console.log('Running idempotent seed...')

  // Upsert a test user by username
  const user = await prisma.user.upsert({
    where: { username: 'seed_user' },
    update: {},
    create: {
      username: 'seed_user',
      avatarUrl: null,
      gamesPlayed: 0,
      gamesWon: 0,
    },
  })

  // Upsert a test room by code
  const room = await prisma.room.upsert({
    where: { code: 'ABC123' },
    update: {},
    create: {
      code: 'ABC123',
      status: 'LOBBY',
      maxPlayers: 7,
      maphiaCount: 2,
      discussionTime: 2,
    },
  })

  // Ensure there are at least two players in the room
  const playersInRoom = await prisma.player.findMany({ where: { roomId: room.id } })
  if (playersInRoom.length < 2) {
    const missing = 2 - playersInRoom.length
    for (let i = 0; i < missing; i++) {
      await prisma.player.create({
        data: {
          userId: user.id,
          roomId: room.id,
          role: 'PENDING',
          isAlive: true,
          isReady: false,
        },
      })
    }
  }

  console.log('Seed complete:', { userId: user.id, roomId: room.id })
  return { userId: user.id, roomId: room.id }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
