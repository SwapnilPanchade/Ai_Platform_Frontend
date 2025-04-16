"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  FormEvent,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

interface ReceivedMessage {
  senderId: string;
  message: string;
  timestamp: string;
}

export default function WebSocketTestPage() {
  const { token, user, isLoading: isAuthLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>(
    []
  );
  const [socketError, setSocketError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(() => {
    if (socketRef.current || isAuthLoading || !token) {
      if (!isAuthLoading && !token)
        setSocketError("Authentication token not found.");
      return;
    }

    console.log("Attempting to connect WebSocket...");
    setSocketError(null);
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL?.split("/api")[0].replace(
        /^http/,
        "ws"
      ) || "ws://localhost:5001/"; // Fallback

    console.log(
      `WS Client: Attempting to connect to ${backendUrl} (default path) with token: ${!!token}`
    );
    setSocketError(null);

    const newSocket = io(backendUrl, {
      auth: {
        token: token,
      },
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("WebSocket Connected:", newSocket.id);
      setIsConnected(true);
      setSocketError(null);
      socketRef.current = newSocket;
    });

    newSocket.on("disconnect", (reason) => {
      console.log("WebSocket Disconnected:", reason);
      setIsConnected(false);
      socketRef.current = null;
      if (reason === "io server disconnect") {
        setSocketError("Server disconnected.");
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("WebSocket Connection Error:", err);
      setSocketError(`Connection Failed: ${err.message}`);
      setIsConnected(false);
      socketRef.current = null;
    });

    newSocket.on("receiveMessage", (data: ReceivedMessage) => {
      console.log(
        "WS Client: 'receiveMessage' event triggered with data:",
        data
      );
      console.log("Message received from server:", data);

      setReceivedMessages((prevMessages) => [data, ...prevMessages]);
    });

    newSocket.on("errorMessage", (data: { error: string }) => {
      console.error("Server Error Message:", data.error);
      setSocketError(`Server Error: ${data.error}`);
    });

    socketRef.current = newSocket;
  }, [token, isAuthLoading]);
  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting WebSocket...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [connectSocket]);
  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageInput.trim() || !user) return;

    if (socketRef.current && isConnected) {
      const payload = {
        recipientId: user.id, // Send to self if you have userId or change it to decodedUserId for another user
        message: messageInput,
      };
      console.log("Sending message:", payload);
      socketRef.current.emit("sendMessage", payload);
      setMessageInput("");
    } else {
      setSocketError("Not connected to WebSocket server.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">WebSocket Test</h1>

      {/* Connection Status */}
      <div className="mb-4 p-3 rounded-md bg-gray-100">
        Status:{" "}
        {isAuthLoading ? (
          "Authenticating..."
        ) : isConnected ? (
          <span className="text-green-600 font-semibold">Connected</span>
        ) : (
          <span className="text-red-600 font-semibold">Disconnected</span>
        )}
        {socketError && (
          <p className="text-red-500 text-sm mt-1">Error: {socketError}</p>
        )}
      </div>

      {/* Only show form if connected */}
      {isConnected && (
        <form onSubmit={handleSendMessage} className="mb-4 flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Enter message..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      )}

      {/* Received Messages */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Received Messages:</h2>
        <div className="h-64 overflow-y-auto p-3 border border-gray-200 rounded-md bg-white space-y-2">
          {receivedMessages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          ) : (
            receivedMessages.map((msg, index) => (
              <div key={index} className="p-2 rounded bg-gray-50 text-sm">
                <span className="font-semibold text-gray-700">
                  [{new Date(msg.timestamp).toLocaleTimeString()}]
                </span>
                <span className="ml-2 text-blue-800">
                  (
                  {msg.senderId === socketRef.current?.id
                    ? "You"
                    : msg.senderId}
                  ):
                </span>{" "}
                {/* Basic sender ID */}
                <span className="ml-2 text-gray-900">{msg.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
