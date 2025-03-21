const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Config
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const USERNAME_PARTS = {
  colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
  animals: ['Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle'],
  fruits: ['Apple', 'Banana', 'Orange', 'Grape', 'Mango']
};

// Data stores
const activeRooms = new Map();
const userSessions = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Helpers
const generateRoomCode = () => {
  let code;
  do {
    code = Array.from({length: ROOM_CODE_LENGTH}, () => 
      ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    ).join('');
  } while (activeRooms.has(code));
  return code;
};

const generateUsername = () => {
  return Object.values(USERNAME_PARTS).map(arr => 
    arr[Math.floor(Math.random() * arr.length)]
  ).join('-');
};

// Socket handlers
const handleCreateRoom = (socket, callback) => {
  try {
    const roomCode = generateRoomCode();
    const username = generateUsername();
    
    activeRooms.set(roomCode, {
      admin: socket.id,
      users: new Map([[socket.id, username]]),
      created: Date.now()
    });
    
    userSessions.set(socket.id, {
      room: roomCode,
      username,
      isAdmin: true
    });

    console.log(`[${new Date().toISOString()}] Room created: ${roomCode}`);
    callback({ status: 'success', roomCode, username });
  } catch (error) {
    console.error('Create room error:', error);
    callback({ status: 'error', message: 'Failed to create room' });
  }
};

const handleJoinRoom = (socket, roomCode, callback) => {
  try {
    roomCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (roomCode.length !== ROOM_CODE_LENGTH) {
      return callback({ status: 'error', message: 'Invalid room code' });
    }

    if (!activeRooms.has(roomCode)) {
      return callback({ status: 'error', message: 'Room not found' });
    }

    const room = activeRooms.get(roomCode);
    if (room.users.has(socket.id)) {
      return callback({ status: 'error', message: 'Already in this room' });
    }

    const username = generateUsername();
    room.users.set(socket.id, username);
    userSessions.set(socket.id, {
      room: roomCode,
      username,
      isAdmin: false
    });

    socket.join(roomCode);
    console.log(`[${new Date().toISOString()}] ${username} joined ${roomCode}`);
    
    // Notify room except sender
    socket.to(roomCode).emit('user-joined', username);
    callback({ status: 'success', roomCode, username });

  } catch (error) {
    console.error('Join room error:', error);
    callback({ status: 'error', message: 'Failed to join room' });
  }
};

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  socket.on('create-room', (callback) => handleCreateRoom(socket, callback));
  socket.on('join-room', (roomCode, callback) => handleJoinRoom(socket, roomCode, callback));

  socket.on('close-room', (roomCode) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session || !session.isAdmin) return;

      const room = activeRooms.get(roomCode);
      if (room && room.admin === socket.id) {
        io.to(roomCode).emit('room-closed');
        activeRooms.delete(roomCode);
        console.log(`[${new Date().toISOString()}] Room closed: ${roomCode}`);
      }
    } catch (error) {
      console.error('Close room error:', error);
    }
  });

  socket.on('send-message', (message) => {
    try {
      const session = userSessions.get(socket.id);
      if (!session || !activeRooms.has(session.room)) return;

      io.to(session.room).emit('new-message', {
        username: session.username,
        message: message.trim(),
        isAdmin: session.isAdmin,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Message send error:', error);
    }
  });


  const handleJoinRoom = (socket, roomCode, callback) => {
    try {
        // Validate input
        roomCode = roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        if (roomCode.length !== 6) {
            return callback({ 
                status: 'error', 
                message: 'Invalid room code format' 
            });
        }

        // Check room existence
        if (!activeRooms.has(roomCode)) {
            return callback({ 
                status: 'error', 
                message: 'Room not found. Check the code and try again.' 
            });
        }

        const room = activeRooms.get(roomCode);

        // Check if already in room
        if (room.users.has(socket.id)) {
            return callback({ 
                status: 'error', 
                message: "You're already in this room!"
            });
        }

        // Generate username and add to room
        const username = generateUsername();
        room.users.set(socket.id, username);
        userSessions.set(socket.id, {
            room: roomCode,
            username,
            isAdmin: false
        });

        // Join room and notify others
        socket.join(roomCode);
        socket.to(roomCode).emit('user-joined', username);
        
        console.log(`[${new Date().toISOString()}] ${username} joined ${roomCode}`);
        callback({ 
            status: 'success', 
            roomCode, 
            username 
        });

    } catch (error) {
        console.error('Join room error:', error);
        callback({ 
            status: 'error', 
            message: 'Failed to join room. Please try again.' 
        });
    }
};


  socket.on('disconnect', () => {
    try {
      const session = userSessions.get(socket.id);
      if (!session) return;

      const room = activeRooms.get(session.room);
      if (room) {
        room.users.delete(socket.id);
        if (room.users.size === 0) {
          activeRooms.delete(session.room);
        } else {
          socket.to(session.room).emit('user-left', session.username);
        }
      }
      userSessions.delete(socket.id);
      console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));