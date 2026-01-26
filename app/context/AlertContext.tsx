import React, { createContext, useCallback, useContext, useState } from 'react';
import CustomAlert, { AlertButton } from '../../components/CustomAlert';

interface AlertContextType {
    showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [buttons, setButtons] = useState<AlertButton[]>([]);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    const showAlert = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
        setTitle(title);
        setMessage(message);

        // Wrap button callbacks to also hide the alert
        const wrappedButtons = buttons?.map(btn => ({
            ...btn,
            onPress: () => {
                hideAlert(); // Hide first
                if (btn.onPress) btn.onPress(); // Then execute callback
            }
        })) || [{ text: 'OK', onPress: hideAlert }];

        setButtons(wrappedButtons);
        setVisible(true);
    }, [hideAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={title}
                message={message}
                buttons={buttons}
                onDismiss={hideAlert}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
