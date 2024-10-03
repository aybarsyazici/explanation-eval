import { useEffect, useRef, useState } from "react";
import { BackendResponse } from "../types";

// Custom hook for WebSocket connection management
export const useWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket>(new WebSocket(url)); // Always initialized
    const [isConnected, setIsConnected] = useState(false);
  
    const childOnDataReceive = useRef<(data: BackendResponse) => void>(() => {});
    const childOnErrorReceive = useRef<(error: Event) => void>(() => {});
  
    const setOnChildDataReceive = (fn: (data: BackendResponse) => void) => {
      childOnDataReceive.current = fn;
    };
  
    const setOnChildErrorReceive = (fn: (error: Event) => void) => {
      childOnErrorReceive.current = fn;
    };
  
    useEffect(() => {
      let shouldReconnect = true;
  
      const connectWebSocket = () => {
        const webSocket = wsRef.current;
  
        webSocket.onopen = () => {
          console.log("WebSocket connection established");
          setIsConnected(true); // Mark as connected
        };
  
        webSocket.onmessage = (event) => {
          if (event.data === "ping") {
            console.log("Received ping message");
            return;
          }
  
          const dataBackEnd = JSON.parse(event.data) as BackendResponse;
          if (childOnDataReceive.current) {
            childOnDataReceive.current(dataBackEnd);
          }
        };
  
        webSocket.onerror = (error) => {
          console.log("WebSocket error:", error);
          if (childOnErrorReceive.current) {
            childOnErrorReceive.current(error);
          }
        };
  
        webSocket.onclose = (event) => {
          console.log(
            "WebSocket connection closed",
            event.code,
            event.reason,
            "Reconnecting...",
          );
          setIsConnected(false); // Mark as disconnected
          if (shouldReconnect) {
            setTimeout(() => {
              wsRef.current = new WebSocket(url); // Reinitialize the WebSocket object
              connectWebSocket();
            }, 3500); // Reconnect after a delay
          }
        };
      };
  
      connectWebSocket();
  
      return () => {
        shouldReconnect = false;
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }, [url]); // Depend on the WebSocket URL
  
    return {
      ws: wsRef.current,
      isConnected,
      setOnChildDataReceive,
      setOnChildErrorReceive,
    };
  };

export default useWebSocket;