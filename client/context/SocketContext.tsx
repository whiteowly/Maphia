import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of our context
interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
 
  // CHECK SERVER LOGS: Use the IP labeled "Wi-Fi" or "Ethernet"
  const socket = useMemo(() => io("http://192.168.1.5:3000", {
    transports: ['websocket'],
    autoConnect: true,
  }), []);

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to Server:', socket.id));
    socket.on('connect_error', (err) => console.log('Socket Connect Error:', err.message));
    socket.on('disconnect', () => console.log('Disconnected from Server'));

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for easy access in your components
export const useSocket = () => useContext(SocketContext);