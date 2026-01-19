import React, { createContext, ReactNode, useContext, useState } from 'react';
import { DEFAULT_GAME_SETTINGS, GameSettings, GameState, generateRoomCode, Player } from '../types/game';

interface GameContextType {
    // Game settings (set by host during game creation)
    settings: GameSettings;
    updateSettings: (updates: Partial<GameSettings>) => void;

    // Players in the game
    players: Player[];
    addPlayer: (player: Player) => void;
    removePlayer: (playerId: string) => void;
    updatePlayer: (playerId: string, updates: Partial<Player>) => void;
    setPlayers: (players: Player[]) => void;

    // Game phase
    phase: GameState['phase'];
    setPhase: (phase: GameState['phase']) => void;

    // Current round
    currentRound: number;
    setCurrentRound: (round: number) => void;

    // Timer
    timeRemaining: number;
    setTimeRemaining: (time: number) => void;

    // Current player role (for the local player)
    myRole: 'maphia' | 'civilian' | null;
    setMyRole: (role: 'maphia' | 'civilian' | null) => void;

    // Current player info
    myPlayerId: string | null;
    setMyPlayerId: (id: string | null) => void;

    // Is host
    isHost: boolean;
    setIsHost: (isHost: boolean) => void;

    // Reset game
    resetGame: () => void;

    // Initialize a new game (host)
    initializeGame: (settings: Partial<GameSettings>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GameSettings>({
        ...DEFAULT_GAME_SETTINGS,
        roomCode: generateRoomCode(),
    });
    const [players, setPlayersState] = useState<Player[]>([]);
    const [phase, setPhase] = useState<GameState['phase']>('lobby');
    const [currentRound, setCurrentRound] = useState(1);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [myRole, setMyRole] = useState<'maphia' | 'civilian' | null>(null);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);

    const updateSettings = (updates: Partial<GameSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const addPlayer = (player: Player) => {
        setPlayersState(prev => [...prev, player]);
    };

    const removePlayer = (playerId: string) => {
        setPlayersState(prev => prev.filter(p => p.id !== playerId));
    };

    const updatePlayer = (playerId: string, updates: Partial<Player>) => {
        setPlayersState(prev =>
            prev.map(p => p.id === playerId ? { ...p, ...updates } : p)
        );
    };

    const setPlayers = (newPlayers: Player[]) => {
        setPlayersState(newPlayers);
    };

    const resetGame = () => {
        setSettings({ ...DEFAULT_GAME_SETTINGS, roomCode: generateRoomCode() });
        setPlayersState([]);
        setPhase('lobby');
        setCurrentRound(1);
        setTimeRemaining(0);
        setMyRole(null);
        setMyPlayerId(null);
        setIsHost(false);
    };

    const initializeGame = (newSettings: Partial<GameSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings,
            roomCode: newSettings.roomCode || generateRoomCode(),
        }));
        setPhase('lobby');
        setCurrentRound(1);
    };

    return (
        <GameContext.Provider
            value={{
                settings,
                updateSettings,
                players,
                addPlayer,
                removePlayer,
                updatePlayer,
                setPlayers,
                phase,
                setPhase,
                currentRound,
                setCurrentRound,
                timeRemaining,
                setTimeRemaining,
                myRole,
                setMyRole,
                myPlayerId,
                setMyPlayerId,
                isHost,
                setIsHost,
                resetGame,
                initializeGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export default GameContext;
