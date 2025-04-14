const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'lan_talk_secret_key';

// Track online users
const onlineUsers = new Map(); // Maps socketId to { userId, username }

/**
 * Authenticate socket connection using token
 * @param {Object} socket Socket.io socket object
 * @param {string} token JWT token
 * @returns {Object|null} User object if authenticated, null otherwise
 */
const authenticateSocket = (socket, token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user in database
    const user = userModel.findById(decoded.id);
    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return null;
    }

    return user;
  } catch (error) {
    socket.emit('error', { message: 'Authentication failed' });
    return null;
  }
};

/**
 * Broadcast online users to all connected clients
 * @param {Object} io Socket.io server instance
 */
const broadcastOnlineUsers = (io) => {
  const users = Array.from(onlineUsers.values()).map(({ userId, username }) => ({ userId, username }));
  io.emit('online_users', { users });
  console.log(`Broadcasting online users: ${users.length} users online`);
};

/**
 * Initialize all socket handlers
 * @param {Object} io Socket.io server instance
 */
const initializeSocketHandlers = (io) => {
  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', ({ token }) => {
      const user = authenticateSocket(socket, token);
      if (!user) return;

      // Store user info
      onlineUsers.set(socket.id, {
        userId: user.id,
        username: user.username,
        socketId: socket.id
      });

      // Notify user of successful authentication
      socket.emit('authenticated', {
        userId: user.id,
        username: user.username
      });

      console.log(`User authenticated: ${user.username} (${socket.id})`);

      // Broadcast updated online users
      broadcastOnlineUsers(io);
    });

    // Handle messaging
    socket.on('message', ({ receiverId, content, type = 'text' }) => {
      // Get sender information
      const sender = onlineUsers.get(socket.id);
      if (!sender) {
        socket.emit('error', { message: 'You are not authenticated' });
        return;
      }

      // Find receiver socket
      const receiver = Array.from(onlineUsers.values()).find(user => user.userId === receiverId);

      // Create message object
      const message = {
        id: Date.now().toString(),
        sender: {
          userId: sender.userId,
          username: sender.username
        },
        content,
        type,
        timestamp: new Date().toISOString()
      };

      console.log(`Message from ${sender.username} to ${receiver ? receiver.username : receiverId}`);

      // Send to receiver if online
      if (receiver) {
        io.to(receiver.socketId).emit('message', message);
      }

      // Send confirmation to sender
      socket.emit('message_sent', {
        messageId: message.id,
        receiverId,
        timestamp: message.timestamp,
        status: receiver ? 'delivered' : 'pending'
      });
    });

    // Handle call signaling
    socket.on('call_request', ({ receiverId, signal, callType }) => {
      const caller = onlineUsers.get(socket.id);
      if (!caller) {
        socket.emit('error', { message: 'You are not authenticated' });
        return;
      }

      // Find receiver socket
      const receiver = Array.from(onlineUsers.values()).find(user => user.userId === receiverId);
      if (!receiver) {
        socket.emit('call_error', { message: 'User is not online' });
        return;
      }

      console.log(`Call request from ${caller.username} to ${receiver.username} (${callType})`);

      // Send call request to receiver
      io.to(receiver.socketId).emit('call_incoming', {
        callerId: caller.userId,
        callerName: caller.username,
        signal,
        callType
      });
    });

    // Handle call response
    socket.on('call_response', ({ callerId, accepted, signal }) => {
      const responder = onlineUsers.get(socket.id);
      if (!responder) {
        socket.emit('error', { message: 'You are not authenticated' });
        return;
      }

      // Find caller socket
      const caller = Array.from(onlineUsers.values()).find(user => user.userId === callerId);
      if (!caller) {
        socket.emit('call_error', { message: 'Caller is not online anymore' });
        return;
      }

      console.log(`Call response from ${responder.username} to ${caller.username}: ${accepted ? 'accepted' : 'rejected'}`);

      // Send response to caller
      io.to(caller.socketId).emit('call_response', {
        responderId: responder.userId,
        responderName: responder.username,
        accepted,
        signal: signal || null
      });
    });

    // Handle ICE candidates exchange
    socket.on('ice_candidate', ({ targetId, candidate }) => {
      const sender = onlineUsers.get(socket.id);
      if (!sender) return;

      // Find target socket
      const target = Array.from(onlineUsers.values()).find(user => user.userId === targetId);
      if (!target) return;

      // Send candidate to target
      io.to(target.socketId).emit('ice_candidate', {
        senderId: sender.userId,
        candidate
      });
    });

    // Handle call end
    socket.on('call_end', ({ targetId }) => {
      const sender = onlineUsers.get(socket.id);
      if (!sender) return;

      // Find target socket
      const target = Array.from(onlineUsers.values()).find(user => user.userId === targetId);
      if (!target) return;

      console.log(`Call ended by ${sender.username} with ${target.username}`);

      // Notify target
      io.to(target.socketId).emit('call_ended', {
        userId: sender.userId,
        username: sender.username
      });
    });

    // Handle file transfer request
    socket.on('file_transfer_request', ({ receiverId, fileInfo }) => {
      const sender = onlineUsers.get(socket.id);
      if (!sender) {
        socket.emit('error', { message: 'You are not authenticated' });
        return;
      }

      // Find receiver
      const receiver = Array.from(onlineUsers.values()).find(user => user.userId === receiverId);
      if (!receiver) {
        socket.emit('file_transfer_error', {
          message: 'User is not online',
          fileId: fileInfo.id
        });
        return;
      }

      console.log(`File transfer request from ${sender.username} to ${receiver.username}: ${fileInfo.name} (${fileInfo.size} bytes)`);

      // Send file info to receiver
      io.to(receiver.socketId).emit('file_transfer_request', {
        fileId: fileInfo.id,
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        fileType: fileInfo.type,
        senderId: sender.userId,
        senderName: sender.username
      });
    });

    // Handle file transfer response
    socket.on('file_transfer_response', ({ senderId, fileId, accepted }) => {
      const responder = onlineUsers.get(socket.id);
      if (!responder) return;

      // Find sender
      const sender = Array.from(onlineUsers.values()).find(user => user.userId === senderId);
      if (!sender) return;

      console.log(`File transfer response from ${responder.username} to ${sender.username}: ${accepted ? 'accepted' : 'rejected'}`);

      // Send response to sender
      io.to(sender.socketId).emit('file_transfer_response', {
        fileId,
        receiverId: responder.userId,
        accepted
      });
    });

    // Handle file chunk transfer
    socket.on('file_chunk', ({ receiverId, fileId, chunk, chunkIndex, totalChunks }) => {
      const sender = onlineUsers.get(socket.id);
      if (!sender) return;

      // Find receiver
      const receiver = Array.from(onlineUsers.values()).find(user => user.userId === receiverId);
      if (!receiver) return;

      // Forward chunk to receiver
      io.to(receiver.socketId).emit('file_chunk', {
        fileId,
        senderId: sender.userId,
        chunk,
        chunkIndex,
        totalChunks
      });

      // Log progress at certain intervals or at the end
      if (chunkIndex === 0 || chunkIndex === totalChunks - 1 || chunkIndex % Math.floor(totalChunks / 10) === 0) {
        console.log(`File transfer progress: ${chunkIndex + 1}/${totalChunks} chunks`);
      }
    });

    // Handle file transfer completion
    socket.on('file_transfer_complete', ({ receiverId, fileId }) => {
      const sender = onlineUsers.get(socket.id);
      if (!sender) return;

      // Find receiver
      const receiver = Array.from(onlineUsers.values()).find(user => user.userId === receiverId);
      if (!receiver) return;

      console.log(`File transfer completed from ${sender.username} to ${receiver.username}`);

      // Notify receiver of completion
      io.to(receiver.socketId).emit('file_transfer_complete', {
        fileId,
        senderId: sender.userId,
        senderName: sender.username
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        console.log(`User disconnected: ${user.username} (${socket.id})`);
        onlineUsers.delete(socket.id);
        broadcastOnlineUsers(io);
      } else {
        console.log(`Socket disconnected: ${socket.id}`);
      }
    });
  });
};

module.exports = { initializeSocketHandlers, onlineUsers };
