import React, { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from ".";

// Define the shape of the context
interface WebSocketContextProps {
    ws: WebSocket;
    isConnected: boolean;
    setOnChildDataReceive: (fn: (data: any) => void) => void;
    setOnChildErrorReceive: (fn: (error: Event) => void) => void;
}

// Create the context
const WebSocketContext = createContext<WebSocketContextProps | undefined>(
  undefined,
);

interface WebSocketProviderProps {
    children?: ReactNode;
    backendUrl: string;
}

// Create a provider component
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  backendUrl,
}) => {
  const { ws, isConnected, setOnChildDataReceive, setOnChildErrorReceive } = useWebSocket(backendUrl);

  return (
    <WebSocketContext.Provider value={{ws, isConnected, setOnChildDataReceive, setOnChildErrorReceive  }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use the AppVersionContext
export const useWebSocketContext = (): WebSocketContextProps => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocket must be used within an WebSocketProvider",
    );
  }
  return context;
};
