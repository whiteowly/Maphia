import { io, Socket } from 'socket.io-client';

// --- IMPORTANT: SERVER URL ---
// If running on an Android Emulator, use 'http://10.0.2.2:3001'.
// If running on a physical device, replace with your computer's local IP address.
// (Find your IP by running 'ipconfig' on Windows or 'ifconfig' on macOS/Linux).
// For iOS simulator, 'localhost' should work, but your IP is safer.
export const SERVER_URL = 'https://maphia-5u6b.onrender.com'; // Using Android Emulator IP as a common default

// Event types
export type GamePhase = 'lobby' | 'role_reveal' | 'discussion' | 'voting' | 'results' | 'game_over';

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    isDead: boolean;
    isMuted: boolean;
}

export interface GameSettings {
    maxPlayers: number;
    maphiaCount: number;
    discussionTimeSeconds: number;
    votingTimeSeconds: number;
}

export interface RoomState {
    roomCode: string;
    hostId: string;
    settings: GameSettings;
    phase: GamePhase;
    currentRound: number;
    timeRemaining: number;
    playerCount: number;
}

export interface RoomUpdate {
    state: RoomState;
    players: Player[];
}

export interface RoleAssignment {
    role: 'maphia' | 'civilian';
    teammates: { id: string; name: string }[];
}

export interface VotingResults {
    eliminated: string | null;
    eliminatedName: string | null;
    eliminatedRole: string | null;
    tie: boolean;
    voteCounts: Record<string, number>;
}

export interface GameOverData {
    winner: 'maphia' | 'civilians';
    allRoles: Record<string, { name: string; role: string; isDead: boolean }>;
}

// Callback types
type CreateRoomCallback = (data: { success: boolean; roomCode?: string; playerId?: string; isHost?: boolean; error?: string }) => void;
type JoinRoomCallback = (data: { success: boolean; roomCode?: string; playerId?: string; isHost?: boolean; error?: string }) => void;
type StartGameCallback = (data: { success: boolean; error?: string }) => void;
type SubmitVoteCallback = (data: { success: boolean; error?: string }) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    // Connect to the server
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            this.socket = io(SERVER_URL, {
                transports: ['websocket'],
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('Connected to server:', this.socket?.id);
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                reject(error);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected:', reason);
                this.emit('disconnected', { reason });
            });

            // Set up event forwarding
            this.setupEventListeners();
        });
    }

    // Disconnect from the server
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Check if connected
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    // Get socket ID
    getSocketId(): string | null {
        return this.socket?.id ?? null;
    }

    // Set up event listeners
    private setupEventListeners(): void {
        if (!this.socket) return;

        const events = [
            'room_update',
            'player_joined',
            'player_left',
            'game_started',
            'role_assigned',
            'phase_changed',
            'timer_update',
            'vote_submitted',
            'voting_results',
            'game_over',
        ];

        events.forEach((event) => {
            this.socket?.on(event, (data: any) => {
                this.emit(event, data);
            });
        });
    }

    // Create a new room
    createRoom(name: string, settings: Partial<GameSettings>, callback: CreateRoomCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('create_room', { name, settings }, callback);
    }

    // Join an existing room
    joinRoom(roomCode: string, name: string, callback: JoinRoomCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('join_room', { roomCode, name }, callback);
    }

    // Set ready status
    setReady(isReady: boolean): void {
        this.socket?.emit('set_ready', { isReady });
    }

    // Start the game (host only)
    startGame(callback: StartGameCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('start_game', {}, callback);
    }

    // Continue from role reveal
    continueFromReveal(): void {
        this.socket?.emit('continue_from_reveal');
    }

    // Submit a vote
    submitVote(targetId: string | null, callback: SubmitVoteCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('submit_vote', { targetId }, callback);
    }

    // Toggle mute
    toggleMute(isMuted: boolean): void {
        this.socket?.emit('toggle_mute', { isMuted });
    }

    // Subscribe to events
    on(event: string, callback: Function): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    // Emit to local listeners
    private emit(event: string, data: any): void {
        this.listeners.get(event)?.forEach((callback) => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
