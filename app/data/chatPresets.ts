/**
 * Pre-built chat messages for Maphia
 * Organized by category for the Quick Chat tab
 */

export interface PresetMessage {
    id: string;
    text: string;
    category: PresetCategory;
}

export type PresetCategory = 'accuse' | 'defend' | 'strategy' | 'react';

export const PRESET_CATEGORIES: { key: PresetCategory; label: string; color: string }[] = [
    { key: 'accuse', label: 'Accuse', color: '#FF4444' },
    { key: 'defend', label: 'Defend', color: '#3B82F6' },
    { key: 'strategy', label: 'Strategy', color: '#F59E0B' },
    { key: 'react', label: 'React', color: '#8B5CF6' },
];

export const PRESET_MESSAGES: PresetMessage[] = [
    // Accuse
    { id: 'acc_1', text: "I think it's you", category: 'accuse' },
    { id: 'acc_2', text: "They're sus", category: 'accuse' },
    { id: 'acc_3', text: "Vote them out!", category: 'accuse' },
    { id: 'acc_4', text: "I don't trust them", category: 'accuse' },
    { id: 'acc_5', text: "It has to be them", category: 'accuse' },

    // Defend
    { id: 'def_1', text: "It's not me!", category: 'defend' },
    { id: 'def_2', text: "I'm innocent", category: 'defend' },
    { id: 'def_3', text: "Trust me", category: 'defend' },
    { id: 'def_4', text: "Why would I do that?", category: 'defend' },
    { id: 'def_5', text: "You're wrong about me", category: 'defend' },

    // Strategy
    { id: 'str_1', text: "Skip this round", category: 'strategy' },
    { id: 'str_2', text: "Let's discuss", category: 'strategy' },
    { id: 'str_3', text: "Who do we vote?", category: 'strategy' },
    { id: 'str_4', text: "Follow my lead", category: 'strategy' },
    { id: 'str_5', text: "We need a plan", category: 'strategy' },

    // React
    { id: 'rct_1', text: "That's sus", category: 'react' },
    { id: 'rct_2', text: "I agree", category: 'react' },
    { id: 'rct_3', text: "No way!", category: 'react' },
    { id: 'rct_4', text: "Interesting...", category: 'react' },
    { id: 'rct_5', text: "GG", category: 'react' },
    { id: 'rct_6', text: "LMAO", category: 'react' },
];

/**
 * Look up a preset message by ID
 */
export function getPresetText(presetId: string): string {
    return PRESET_MESSAGES.find(m => m.id === presetId)?.text || presetId;
}

/**
 * Get presets filtered by category
 */
export function getPresetsByCategory(category: PresetCategory): PresetMessage[] {
    return PRESET_MESSAGES.filter(m => m.category === category);
}
