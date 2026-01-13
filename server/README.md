# Maphia Game Server

Socket.io backend server for the Maphia multiplayer game.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev   # Development (with auto-reload)
   npm start     # Production
   ```

3. **Server runs on:** `http://localhost:3001`

## API Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ name, settings }` | Create a new game room |
| `join_room` | `{ roomCode, name }` | Join an existing room |
| `set_ready` | `{ isReady }` | Set player ready status |
| `start_game` | `{}` | Start the game (host only) |
| `continue_from_reveal` | `{}` | Continue after role reveal |
| `submit_vote` | `{ targetId }` | Submit vote for a player |
| `toggle_mute` | `{ isMuted }` | Toggle mute status |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room_update` | `{ state, players }` | Room state updated |
| `player_joined` | `{ playerId, name }` | New player joined |
| `player_left` | `{ playerId, name, newHostId }` | Player left |
| `game_started` | `{ phase }` | Game has started |
| `role_assigned` | `{ role, teammates }` | Your role (private) |
| `phase_changed` | `{ phase, timeRemaining }` | Game phase changed |
| `timer_update` | `{ timeRemaining }` | Timer tick |
| `vote_submitted` | `{ voterId, totalVotes, totalVoters }` | Vote count update |
| `voting_results` | `{ eliminated, eliminatedRole, tie, voteCounts }` | Voting results |
| `game_over` | `{ winner, allRoles }` | Game ended |

## Game Flow

```
1. lobby         - Players join and ready up
2. role_reveal   - Roles assigned and shown (5s)
3. discussion    - Players discuss (configurable timer)
4. voting        - Players vote (configurable timer)
5. results       - Show who was eliminated
6. (repeat 3-5 until win condition)
7. game_over     - Show winner and all roles
```

## Win Conditions

- **Civilians win:** All maphias eliminated
- **Maphias win:** Maphia count >= Civilian count
