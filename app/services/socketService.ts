import { io, Socket } from 'socket.io-client';

// Server URL configuration
// __DEV__ is true when running locally in development mode
const DEV_URL = process.env.EXPO_PUBLIC_DEV_API_URL || 'http://192.168.1.4:3001';
const PROD_URL = process.env.EXPO_PUBLIC_PROD_API_URL || 'https://maphia-5u6b.onrender.com';

// Automatically select URL based on environment
export const SERVER_URL = __DEV__ ? DEV_URL : PROD_URL;

// Debug log for checking connection URL
console.log(`[SocketService] Connecting to: ${SERVER_URL} (DEV: ${__DEV__})`);

// Event types
export type GamePhase = 'lobby' | 'role_reveal' | 'night' | 'guardian' | 'discussion' | 'voting' | 'results' | 'game_over';

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    isDead: boolean;
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
    role: 'maphia' | 'civilian' | 'guardian' | 'joker';
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
    winner: 'maphia' | 'civilians' | 'joker';
    jokerId?: string;
    jokerName?: string;
    allRoles: Record<string, { name: string; role: string; isDead: boolean }>;
}

export interface NightResults {
    killed: string | null;
    killedName: string | null;
    targeted: string | null;
    targetedName: string | null;
    saved: boolean;
    guardianMistake: boolean;
    guardianSavedId?: string | null;
    guardianSavedName?: string | null;
}

// Callback types
type CreateRoomCallback = (data: { success: boolean; roomCode?: string; playerId?: string; isHost?: boolean; error?: string }) => void;
type JoinRoomCallback = (data: { success: boolean; roomCode?: string; playerId?: string; isHost?: boolean; error?: string }) => void;
type StartGameCallback = (data: { success: boolean; error?: string }) => void;
type SubmitVoteCallback = (data: { success: boolean; error?: string }) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private gameOverData: any = null;

    // Store game over data for retrieval
    setGameOverData(data: any): void {
        this.gameOverData = data;
    }

    // Get stored game over data
    getGameOverData(): any {
        return this.gameOverData;
    }

    // Send event to server (public method for game over screen)
    sendEvent(event: string, data: any): void {
        this.socket?.emit(event, data);
    }

    // Connect to the server
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            this.socket = io(SERVER_URL, {
                transports: ['polling', 'websocket'], // Allow polling fallback for Render compatibility
                autoConnect: true,
                timeout: 20000, // Increase timeout for Render cold starts
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
            'night_results', // Bug 3 Fix: Add missing event for night results
            'game_over',
            'return_to_lobby',
            'host_left',
            'waiting_for_host',
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

    // Submit a night vote (Maphia only)
    submitNightVote(targetId: string | null, callback: SubmitVoteCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('submit_night_vote', { targetId }, callback);
    }

    // Submit guardian save (Guardian only)
    submitGuardianSave(targetId: string | null, callback: SubmitVoteCallback): void {
        if (!this.socket) {
            callback({ success: false, error: 'Not connected' });
            return;
        }

        this.socket.emit('submit_guardian_save', { targetId }, callback);
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
