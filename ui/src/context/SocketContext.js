import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('placifyToken');
    const userRaw = localStorage.getItem('placifyUser');
    const user = userRaw ? JSON.parse(userRaw) : null;

    if (user && token) {
      const socketInstance = io('http://localhost:5000', {
        auth: { token },
      });

      setSocket(socketInstance);

      socketInstance.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
