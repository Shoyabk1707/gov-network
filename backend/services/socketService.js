const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this._io = null;
    this._onlineUsers = new Map();
  }

  init(httpServer, allowedOrigins) {
    this._io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.attachListeners();
    return this._io;
  }

  attachListeners() {
    const io = this._io;
    
    io.on('connection', (socket) => {
      console.log(`⚡ Enterprise Socket Connected: ${socket.id}`);

      // 1. Authenticate user and map session
      socket.on('setup_session', (userId) => {
        if (userId) {
          this._onlineUsers.set(String(userId), socket.id);
          socket.join(String(userId)); // Personal Private Room
          io.emit('update_online_users', Array.from(this._onlineUsers.keys()));
        }
      });

      // 2. Join a dedicated conversation room
      socket.on('join_chat_room', (conversationId) => {
        socket.join(String(conversationId));
      });

      // 3. Real-time text/media dispatch relays
      socket.on('send_instant_message', (messageData) => {
        const { conversationId, recipientId } = messageData;
        const isRecipientOnline = this._onlineUsers.has(String(recipientId));
        
        if (isRecipientOnline) {
          messageData.status = 'delivered';
        }

        socket.to(String(conversationId)).emit('receive_instant_message', messageData);
        
        const recipientSocketId = this._onlineUsers.get(String(recipientId));
        if (recipientSocketId) {
          // 🚀 ENTERPRISE SIGNAL BROADCAST: Alerts background layers anywhere across the application viewport instantly
          io.to(String(recipientId)).emit('incoming_message_notification', {
            conversationId,
            text: messageData.text || '🖼️ Sent an attachment'
          });
          
          socket.emit('message_status_updated_direct', {
            messageId: messageData._id,
            conversationId,
            status: 'delivered'
          });
        }
      });

      // 4. Real-time Message Deletion Broadcast Relay
      socket.on('delete_message_trigger', (deletePayload) => {
        const { conversationId, messageId } = deletePayload;
        socket.to(String(conversationId)).emit('message_deleted_realtime', { messageId });
      });

      // 5. Real-time Double Blue Ticks Broadcast Relay
      socket.on('mark_conversation_read', (readPayload) => {
        const { conversationId, readerId } = readPayload;
        socket.to(String(conversationId)).emit('message_read_realtime', { conversationId, readerId });
      });

      // 6. Relay typing states instantly
      socket.on('user_typing_state', (typingData) => {
        const { conversationId } = typingData;
        socket.to(String(conversationId)).emit('user_typing_state', typingData);
      });

      socket.on('disconnect', () => {
        for (let [userId, socketId] of this._onlineUsers.entries()) {
          if (socketId === socket.id) {
            this._onlineUsers.delete(userId);
            break;
          }
        }
        io.emit('update_online_users', Array.from(this._onlineUsers.keys()));
      });
    });
  }

  emitToUser(userId, eventName, payload) {
    if (this._io) {
      this._io.to(String(userId)).emit(eventName, payload);
    }
  }
}

module.exports = new SocketService();