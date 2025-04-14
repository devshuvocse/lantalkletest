import React from "react";
import { Input } from "@/components/ui/input";

interface User {
  userId: string;
  username: string;
}

interface SidebarProps {
  onlineUsers: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  currentUser: User | null;
}

export default function Sidebar({
  onlineUsers,
  selectedUser,
  onSelectUser,
  currentUser
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter users based on search term and exclude current user
  const filteredUsers = onlineUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    user.userId !== currentUser?.userId
  );

  return (
    <div className="w-80 bg-slate-900/60 backdrop-blur-md border-r border-blue-800 flex flex-col">
      <div className="p-4 border-b border-blue-800">
        <h2 className="text-blue-300 font-medium mb-2">Online Users</h2>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800/80 border-blue-800 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-blue-300/70 text-sm">
            {searchTerm ? "No users match your search" : "No other users online"}
          </div>
        ) : (
          <ul className="py-2">
            {filteredUsers.map(user => (
              <li key={user.userId}>
                <button
                  onClick={() => onSelectUser(user)}
                  className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-blue-900/30 transition-colors ${
                    selectedUser?.userId === user.userId ? "bg-blue-900/40 border-l-2 border-cyan-400" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-medium">
                    {user.username.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-blue-100 font-medium">{user.username}</div>
                    <div className="text-blue-300/70 text-xs flex items-center">
                      <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full" />
                      Online
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-blue-800 bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-medium">
            {currentUser?.username.substring(0, 1).toUpperCase() || "?"}
          </div>
          <div>
            <div className="text-blue-100 font-medium">
              {currentUser?.username || "Not logged in"}
            </div>
            <div className="text-cyan-400 text-xs">Your Account</div>
          </div>
        </div>
      </div>
    </div>
  );
}
