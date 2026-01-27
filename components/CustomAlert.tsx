import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

export type AlertType = 'info' | 'warning' | 'error' | 'success' | 'blood';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
    type?: AlertType;
}

// Icon logic removed as per user request to remove 'emojis' (icons)

export default function CustomAlert({ visible, title, message, buttons = [], onDismiss, type = 'info' }: CustomAlertProps) {
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 15, stiffness: 150 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            scale.value = withTiming(0.9, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    // Default button if none provided
    const actionButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <Animated.View style={[styles.modalViewContainer, animatedStyle]}>
                    <LinearGradient
                        colors={['#220101', '#4a0000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalView}
                    >
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Text style={styles.modalText}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {actionButtons.map((btn, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.button,
                                        btn.style === 'cancel' && styles.buttonCancel,
                                        btn.style === 'destructive' && styles.buttonDestructive
                                    ]}
                                    onPress={() => {
                                        if (btn.onPress) btn.onPress();
                                        else if (onDismiss) onDismiss();
                                    }}
                                >
                                    <Text style={styles.textStyle}>{btn.text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    modalViewContainer: {
        width: '75%',
        maxWidth: 320,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#ff0000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 15,
        borderWidth: 1.5,
        borderColor: '#610000',
    },
    modalView: {
        paddingVertical: 20,
        paddingHorizontal: 25,
        alignItems: 'center',
    },
    modalTitle: {
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 28,
        color: 'white',
        letterSpacing: 1,
        textShadowColor: 'rgba(255, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#e0d5d0',
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        flexWrap: 'wrap',
    },
    button: {
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#610000',
        minWidth: 90,
        borderColor: 'rgba(255, 0, 0, 0.4)',
        borderWidth: 1,
    },
    buttonCancel: {
        backgroundColor: '#2b2b2b',
        borderColor: '#444',
    },
    buttonDestructive: {
        backgroundColor: '#aa0000',
        borderColor: '#ff4444',
    },
    textStyle: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 18,
    },
});
