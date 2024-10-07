import { useEffect, useRef, useState } from "react";
import { BackendResponse } from "../types";

// Custom hook for WebSocket connection management
export const useWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket | null>(null); // Ref for the WebSocket
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
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log("WebSocket is already connected");
          return; // If WebSocket is already open, don't reconnect
        }

        wsRef.current = new WebSocket(url); // Initialize WebSocket object
  
        wsRef.current.onopen = () => {
          console.log("WebSocket connection established");
          setIsConnected(true); // Mark as connected
        };
  
        wsRef.current.onmessage = (event) => {
          if (event.data === "ping") {
            console.log("Received ping message");
            return;
          }
  
          const dataBackEnd = JSON.parse(event.data) as BackendResponse;
          if (childOnDataReceive.current) {
            childOnDataReceive.current(dataBackEnd);
          }
        };
  
        wsRef.current.onerror = (error) => {
          console.log("WebSocket error:", error);
          if (childOnErrorReceive.current) {
            childOnErrorReceive.current(error);
          }
        };
  
        wsRef.current.onclose = (event) => {
          console.log(
            "WebSocket connection closed",
            event.code,
            event.reason,
            "Reconnecting...",
          );
          setIsConnected(false); // Mark as disconnected
          if (shouldReconnect) {
            setTimeout(() => {
              connectWebSocket(); // Reconnect
            }, 3500); // Reconnect after a delay
          }
        };
      };
  
      connectWebSocket(); // Establish the WebSocket connection
  
      return () => {
        shouldReconnect = false;
        if (wsRef.current) {
          wsRef.current.close(); // Close WebSocket when component unmounts
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
