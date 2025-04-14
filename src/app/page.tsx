"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Socket } from "socket.io-client";

// Import components and utilities
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import CallControls from "@/components/CallControls";
import socketService from "@/utils/socketClient";

interface User {
  userId: string;
  username: string;
}

interface Message {
  id: string;
  sender: {
    userId: string;
    username: string;
  };
  content: string;
  type: "text" | "file";
  timestamp: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [socketConnected, setSocketConnected] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");

    if (!storedUser || !token) {
      router.push("/modern-login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Failed to parse user data:", error);
      router.push("/modern-login");
    }
  }, [router]);

  // Connect to WebSocket server when user is authenticated
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Initialize socket connection
    try {
      // Create a copy of the current value for cleanup
      const socket = socketService.initializeSocket(token);
      socketRef.current = socket;
      setSocketConnected(true);

      // Handle online users updates
      socket.on('online_users', ({ users }: { users: User[] }) => {
        setOnlineUsers(users);
      });

      // Handle incoming messages
      socket.on('message', (message: Message) => {
        // Add message to state
        setMessages(prev => {
          const senderId = message.sender.userId;
          const prevMessages = prev[senderId] || [];
          return {
            ...prev,
            [senderId]: [...prevMessages, message]
          };
        });
      });

      // Cleanup function
      return () => {
        const currentSocket = socketRef.current;
        if (currentSocket) {
          currentSocket.off('online_users');
          currentSocket.off('message');
          socketService.disconnectSocket();
        }
      };
    } catch (error) {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    }
  }, [user]);

  const handleLogout = useCallback(() => {
    socketService.disconnectSocket();
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    router.push("/modern-login");
  }, [router]);

  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
    // Initialize messages for this user if they don't exist
    if (!messages[user.userId]) {
      setMessages(prev => ({
        ...prev,
        [user.userId]: []
      }));
    }
  }, [messages]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedUser || !user || !content.trim() || !socketRef.current) return;

    // Emit message event to server
    socketRef.current.emit('message', {
      receiverId: selectedUser.userId,
      content,
      type: 'text'
    });

    // Create a message object for UI update
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: {
        userId: user.userId,
        username: user.username
      },
      content,
      type: "text",
      timestamp: new Date().toISOString()
    };

    // Add message to state for instant UI update
    setMessages(prev => ({
      ...prev,
      [selectedUser.userId]: [...(prev[selectedUser.userId] || []), newMessage]
    }));
  }, [selectedUser, user]);

  const handleStartCall = useCallback((type: "audio" | "video") => {
    if (!selectedUser || !socketRef.current) return;

    // In a real implementation, this would initiate WebRTC
    console.log(`Starting ${type} call with ${selectedUser.username}`);

    // Emit call request event
    socketRef.current.emit('call_request', {
      receiverId: selectedUser.userId,
      callType: type,
      signal: {} // WebRTC signal data would go here
    });

    setCallType(type);
    setInCall(true);
  }, [selectedUser]);

  const handleEndCall = useCallback(() => {
    if (!selectedUser || !socketRef.current) return;

    // Emit call end event
    socketRef.current.emit('call_end', {
      targetId: selectedUser.userId
    });

    setInCall(false);
    setCallType(null);
  }, [selectedUser]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
      {/* Header with navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-blue-800 py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              LAN_TALK
            </h1>
            {socketConnected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full" />
                Connected
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-blue-200 text-sm">
                Logged in as <span className="font-medium text-blue-300">{user.username}</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm border-blue-700 text-blue-300 hover:bg-blue-800/30"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with contacts */}
        <Sidebar
          onlineUsers={onlineUsers}
          selectedUser={selectedUser}
          onSelectUser={handleUserSelect}
          currentUser={user}
        />

        {/* Chat / call area */}
        <div className="flex-1 flex flex-col">
          {inCall && (
            <div className="flex-1 bg-slate-900/50 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-cyan-400 text-xl font-medium">
                  {callType === "video" ? "Video Call" : "Voice Call"} with {selectedUser?.username}
                </div>
                <div className="p-12 rounded-full bg-blue-900/30 border border-blue-700 mb-4">
                  <svg
                    className="w-20 h-20 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <div className="text-blue-200 mb-8">
                  {callType === "video" ? "Camera and microphone access required" : "Microphone access required"}
                </div>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="bg-red-700 hover:bg-red-800"
                >
                  End Call
                </Button>
              </div>
            </div>
          )}

          {!inCall && (
            <>
              <ChatArea
                messages={selectedUser ? messages[selectedUser.userId] || [] : []}
                onSendMessage={handleSendMessage}
                selectedUser={selectedUser}
                currentUser={user}
              />

              {selectedUser && (
                <CallControls
                  onStartAudioCall={() => handleStartCall("audio")}
                  onStartVideoCall={() => handleStartCall("video")}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
