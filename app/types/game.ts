// Game Types for Maphia

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    isDead: boolean;
    role?: 'maphia' | 'civilian' | 'guardian' | 'joker';
}

export interface GameSettings {
    roomCode: string;
    maxPlayers: number;
    maphiaCount: number;
    discussionTimeSeconds: number; // Changed to seconds (max 120)
    votingTimeSeconds: number; // Changed to seconds (max 120)
}

export interface GameState {
    settings: GameSettings;
    players: Player[];
    phase: 'lobby' | 'role_reveal' | 'night' | 'guardian' | 'discussion' | 'voting' | 'results' | 'game_over';
    currentRound: number;
    timeRemaining: number; // in seconds
    votedPlayer?: string; // player id being voted on
}

// Default settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
    roomCode: '',
    maxPlayers: 7,
    maphiaCount: 2,
    discussionTimeSeconds: 60, // 1 minute default
    votingTimeSeconds: 30, // 30 seconds default
};

// Constraints
export const GAME_CONSTRAINTS = {
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 15,
    MIN_MAPHIAS: 1,
    MAX_MAPHIAS: 3,
    MIN_TIME_SECONDS: 15,
    MAX_TIME_SECONDS: 120,
};

// Helper function to generate room codes
export const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Calculate civilians from settings
export const getCivilianCount = (settings: GameSettings): number => {
    return settings.maxPlayers - settings.maphiaCount;
};

// Format time for display (seconds to readable format)
export const formatTimeDisplay = (seconds: number): string => {
    if (seconds >= 60) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
};

// Format countdown timer (mm:ss)
export const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
