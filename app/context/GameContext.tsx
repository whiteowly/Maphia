import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
    myRole: 'maphia' | 'civilian' | 'guardian' | 'joker' | null;
    setMyRole: (role: 'maphia' | 'civilian' | 'guardian' | 'joker' | null) => void;

    // Current player info
    myPlayerId: string | null;
    setMyPlayerId: (id: string | null) => void;
    myPlayerName: string;
    setMyPlayerName: (name: string) => void;

    // Is host
    isHost: boolean;
    setIsHost: (isHost: boolean) => void;

    // Mafia teammates (for mafia players to know who their team is)
    maphiaTeammates: { id: string; name: string }[];
    setMaphiaTeammates: (teammates: { id: string; name: string }[]) => void;

    // Player name (saved for reuse)
    playerName: string;
    setPlayerName: (name: string) => void;

    // Reset game
    resetGame: () => void;

    // Initialize a new game (host)
    initializeGame: (settings: Partial<GameSettings>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const PLAYER_NAME_KEY = '@maphia_player_name';

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<GameSettings>({
        ...DEFAULT_GAME_SETTINGS,
        roomCode: generateRoomCode(),
    });
    const [players, setPlayersState] = useState<Player[]>([]);
    const [phase, setPhase] = useState<GameState['phase']>('lobby');
    const [currentRound, setCurrentRound] = useState(1);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [myRole, setMyRole] = useState<'maphia' | 'civilian' | 'guardian' | 'joker' | null>(null);
    const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
    const [myPlayerName, setMyPlayerName] = useState<string>('');
    const [isHost, setIsHost] = useState(false);
    const [maphiaTeammates, setMaphiaTeammates] = useState<{ id: string; name: string }[]>([]);
    const [playerName, setPlayerNameState] = useState<string>('');

    // Bug 1 Fix: Load playerName from AsyncStorage on mount
    useEffect(() => {
        const loadPlayerName = async () => {
            try {
                const savedName = await AsyncStorage.getItem(PLAYER_NAME_KEY);
                if (savedName) {
                    setPlayerNameState(savedName);
                }
            } catch (error) {
                console.error('Failed to load player name:', error);
            }
        };
        loadPlayerName();
    }, []);

    // Bug 1 Fix: Wrapper to save playerName to AsyncStorage when changed
    const setPlayerName = async (name: string) => {
        setPlayerNameState(name);
        try {
            await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
        } catch (error) {
            console.error('Failed to save player name:', error);
        }
    };

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
        setMyPlayerName('');
        setIsHost(false);
        setMaphiaTeammates([]);
        // Don't reset playerName - it should persist
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
                myPlayerName,
                setMyPlayerName,
                isHost,
                setIsHost,
                maphiaTeammates,
                setMaphiaTeammates,
                playerName,
                setPlayerName,
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
