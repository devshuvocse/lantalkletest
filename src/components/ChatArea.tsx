import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  selectedUser: User | null;
  currentUser: User | null;
}

export default function ChatArea({
  messages,
  onSendMessage,
  selectedUser,
  currentUser
}: ChatAreaProps) {
  const [message, setMessage] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  // Using messages.length as a dependency to trigger scroll when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: We need to react to changes in messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message);
    setMessage("");
  };

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-sm">
      {selectedUser ? (
        <>
          {/* Chat header */}
          <div className="p-4 border-b border-blue-800 bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-medium">
                {selectedUser.username.substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-blue-100 font-medium">{selectedUser.username}</div>
                <div className="text-blue-300/70 text-xs flex items-center">
                  <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full" />
                  Online
                </div>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-blue-300/70 h-full flex items-center justify-center">
                <div>
                  <div className="mb-2 text-cyan-400 text-2xl">👋</div>
                  <div className="text-lg mb-1">Start a conversation with {selectedUser.username}</div>
                  <div className="text-sm">Your messages are only shared within your local network</div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender.userId === currentUser?.userId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender.userId === currentUser?.userId
                        ? "bg-blue-800/80 text-blue-50"
                        : "bg-slate-800/80 text-blue-100"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {msg.sender.userId === currentUser?.userId
                        ? "You"
                        : msg.sender.username}
                    </div>
                    <div className="break-words">{msg.content}</div>
                    <div className="text-xs mt-1 text-right opacity-70">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input area */}
          <div className="p-4 border-t border-blue-800 bg-slate-900/60 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                type="text"
                placeholder={`Message ${selectedUser.username}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-slate-800/80 border-blue-800 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              >
                Send
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-blue-300/70">
          <div className="text-center">
            <div className="mb-4 text-cyan-400 text-5xl">💬</div>
            <div className="text-xl mb-2">Select a user to start chatting</div>
            <div className="text-sm max-w-md">
              Connect with other users on your network
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
