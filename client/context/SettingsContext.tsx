import React, { createContext, useContext, useState } from 'react';

interface SettingsContextType {
  musicEnabled: boolean;
  setMusicEnabled: (value: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  musicEnabled: true,
  setMusicEnabled: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <SettingsContext.Provider value={{
      musicEnabled,
      setMusicEnabled,
      soundEnabled,
      setSoundEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
