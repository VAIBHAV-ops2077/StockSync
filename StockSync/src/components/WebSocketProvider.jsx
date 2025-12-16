import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Stock update events
    newSocket.on('stockUpdate', (data) => {
      console.log('Stock update received:', data);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('stockUpdate', { detail: data }));
    });

    // Barcode scan events
    newSocket.on('barcodeScan', (data) => {
      console.log('Barcode scan received:', data);
      window.dispatchEvent(new CustomEvent('barcodeScan', { detail: data }));
    });

    // Low stock alerts
    newSocket.on('lowStockAlert', (data) => {
      console.log('Low stock alert:', data);
      window.dispatchEvent(new CustomEvent('lowStockAlert', { detail: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Provide socket instance and helper functions
  const socketHelpers = {
    socket,
    isConnected,
    emitStockUpdate: (productId, newStock) => {
      if (socket) {
        socket.emit('updateStock', { productId, newStock });
      }
    },
    emitBarcodeScan: (barcode) => {
      if (socket) {
        socket.emit('barcodeScan', { barcode, timestamp: new Date() });
      }
    },
    joinRoom: (room) => {
      if (socket) {
        socket.emit('joinRoom', room);
      }
    },
    leaveRoom: (room) => {
      if (socket) {
        socket.emit('leaveRoom', room);
      }
    }
  };

  return (
    <WebSocketContext.Provider value={socketHelpers}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Create context for socket functionality
const WebSocketContext = React.createContext();

// Custom hook to use WebSocket
export function useWebSocket() {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export default WebSocketProvider;
