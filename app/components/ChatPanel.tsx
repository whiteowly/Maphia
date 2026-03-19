import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getPresetsByCategory, getPresetText, PRESET_CATEGORIES, PresetCategory } from '../data/chatPresets';
import socketService from '../services/socketService';

interface ChatMessage {
    senderId: string;
    senderName: string;
    text: string | null;
    isPreset: boolean;
    presetId: string | null;
    timestamp: number;
}

interface ChatPanelProps {
    myPlayerId: string | null;
    isDead?: boolean;
    disabled?: boolean; // Disable chat entirely (e.g. wrong phase)
    allowQuickChat?: boolean;
}

export default function ChatPanel({ myPlayerId, isDead = false, disabled = false, allowQuickChat = true }: ChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeTab, setActiveTab] = useState<'free' | 'quick'>('free');
    const [selectedCategory, setSelectedCategory] = useState<PresetCategory>('accuse');
    const [isSending, setIsSending] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Listen for incoming chat messages
    useEffect(() => {
        const unsub = socketService.on('chat_message', (data: ChatMessage) => {
            setMessages(prev => [...prev, data]);
        });

        return () => unsub();
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSendFreeText = () => {
        if (!inputText.trim() || isSending || isDead || disabled) return;

        setIsSending(true);
        socketService.sendMessage(inputText.trim(), false, null, (response) => {
            if (response.success) {
                setInputText('');
            }
            // Rate limit cooldown (1 second)
            setTimeout(() => setIsSending(false), 1000);
        });

        // Dismiss keyboard on mobile
        if (Platform.OS !== 'web') {
            Keyboard.dismiss();
        }
    };

    const handleSendPreset = (presetId: string) => {
        if (isSending || isDead || disabled) return;

        setIsSending(true);
        socketService.sendMessage(null, true, presetId, (response) => {
            // Rate limit cooldown
            setTimeout(() => setIsSending(false), 1000);
        });
    };

    const canChat = !isDead && !disabled;

    const getDisplayText = (msg: ChatMessage): string => {
        if (msg.isPreset && msg.presetId) {
            return getPresetText(msg.presetId);
        }
        return msg.text || '';
    };

    const isMyMessage = (msg: ChatMessage): boolean => {
        return msg.senderId === myPlayerId;
    };

    return (
        <View style={styles.container}>
            {/* Tab Switcher */}
            {allowQuickChat && (
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'free' && styles.activeTab]}
                        onPress={() => setActiveTab('free')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'free' && styles.activeTabText]}>
                            💬 Chat
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'quick' && styles.activeTab]}
                        onPress={() => setActiveTab('quick')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, activeTab === 'quick' && styles.activeTabText]}>
                            ⚡ Quick
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Messages List (shared between both tabs) */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messageList}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.messageListContent}
            >
                {messages.length === 0 && (
                    <Text style={styles.emptyText}>No messages yet...</Text>
                )}
                {messages.map((msg, index) => {
                    const mine = isMyMessage(msg);
                    return (
                        <View key={`${msg.timestamp}-${index}`} style={[
                            styles.messageBubble,
                            mine ? styles.myBubble : styles.otherBubble,
                            msg.isPreset && styles.presetBubble,
                        ]}>
                            {!mine && (
                                <Text style={styles.senderName}>{msg.senderName}</Text>
                            )}
                            <Text style={[styles.messageText, mine && styles.myMessageText]}>
                                {getDisplayText(msg)}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Input Area */}
            {activeTab === 'free' ? (
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.textInput, (!canChat || isSending) && styles.disabledInput]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={isDead ? "Dead players can't chat" : disabled ? 'Chat unavailable' : 'Type a message...'}
                        placeholderTextColor="#666"
                        maxLength={200}
                        editable={canChat && !isSending}
                        onSubmitEditing={handleSendFreeText}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!canChat || isSending || !inputText.trim()) && styles.disabledSend]}
                        onPress={handleSendFreeText}
                        disabled={!canChat || isSending || !inputText.trim()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sendText}>➤</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.quickChatArea}>
                    {/* Category tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                        {PRESET_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.key}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === cat.key && { backgroundColor: cat.color + '33', borderColor: cat.color },
                                ]}
                                onPress={() => setSelectedCategory(cat.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === cat.key && { color: cat.color },
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Preset message buttons */}
                    <View style={styles.presetGrid}>
                        {getPresetsByCategory(selectedCategory).map(preset => (
                            <TouchableOpacity
                                key={preset.id}
                                style={[styles.presetButton, (!canChat || isSending) && styles.disabledPreset]}
                                onPress={() => handleSendPreset(preset.id)}
                                disabled={!canChat || isSending}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.presetText}>{preset.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Dead/disabled overlay message */}
            {isDead && (
                <View style={styles.deadOverlay}>
                    <Text style={styles.deadText}>☠️ Dead players cannot chat</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#22010180',
        borderRadius: 8,
        overflow: 'hidden',
    },
    // Tab switcher
    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#cabdb7',
    },
    tabText: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#cabdb7',
    },
    // Messages
    messageList: {
        flex: 1,
        paddingHorizontal: 8,
    },
    messageListContent: {
        paddingVertical: 8,
    },
    emptyText: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 4,
    },
    myBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#610000cc',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 4,
    },
    presetBubble: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    senderName: {
        fontFamily: 'Gruesome',
        fontSize: 11,
        color: '#F59E0B',
        marginBottom: 1,
    },
    messageText: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#cabdb7',
    },
    myMessageText: {
        color: '#e8d8d0',
    },
    // Free chat input
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    textInput: {
        flex: 1,
        height: 36,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 18,
        paddingHorizontal: 14,
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#333',
    },
    disabledInput: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#610000',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    disabledSend: {
        backgroundColor: '#333',
    },
    sendText: {
        fontSize: 18,
        color: '#cabdb7',
    },
    // Quick chat
    quickChatArea: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 4,
    },
    categoryRow: {
        paddingHorizontal: 6,
        marginBottom: 4,
        maxHeight: 32,
    },
    categoryChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#444',
        marginRight: 6,
    },
    categoryText: {
        fontFamily: 'Gruesome',
        fontSize: 12,
        color: '#888',
    },
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 6,
        paddingBottom: 6,
    },
    presetButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        margin: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    disabledPreset: {
        opacity: 0.4,
    },
    presetText: {
        fontFamily: 'Gruesome',
        fontSize: 13,
        color: '#cabdb7',
    },
    // Dead overlay
    deadOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    deadText: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#FF6B6B',
    },
});
