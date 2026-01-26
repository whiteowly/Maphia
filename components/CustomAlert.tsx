import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
}

export default function CustomAlert({ visible, title, message, buttons = [], onDismiss }: CustomAlertProps) {
    // Default button if none provided
    const actionButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {actionButtons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.button, btn.style === 'cancel' && styles.buttonCancel]}
                                onPress={() => {
                                    if (btn.onPress) btn.onPress();
                                    else if (onDismiss) onDismiss();
                                }}
                            >
                                <Text style={styles.textStyle}>{btn.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#220101',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: 'red',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#610000',
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 32,
        color: 'white',
    },
    modalText: {
        marginBottom: 25,
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: '#cabdb7',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#610000',
        minWidth: 100,
        borderColor: 'rgba(255, 0, 0, 0.3)',
        borderWidth: 1,
    },
    buttonCancel: {
        backgroundColor: '#333',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Gruesome',
        fontSize: 18,
    },
});
