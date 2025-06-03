// === File: server.js ===
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = {};

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  socket.on('new-user', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user-connected', username);
  });

  socket.on('send-chat-message', (message) => {
    const username = users[socket.id];
    io.emit('chat-message', { message, username });
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    socket.broadcast.emit('user-disconnected', username);
    delete users[socket.id];
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3001');
});

