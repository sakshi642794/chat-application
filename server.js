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


// === File: client/src/App.js ===
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    socket.on('chat-message', ({ message, username }) => {
      setChat((prev) => [...prev, { message, username }]);
    });
    socket.on('user-connected', (name) => {
      setChat((prev) => [...prev, { message: `${name} joined`, username: 'System' }]);
    });
    socket.on('user-disconnected', (name) => {
      setChat((prev) => [...prev, { message: `${name} left`, username: 'System' }]);
    });
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('send-chat-message', message);
      setChat([...chat, { message, username: 'You' }]);
      setMessage('');
    }
  };

  const handleLogin = () => {
    if (username.trim()) {
      socket.emit('new-user', username);
      setIsLoggedIn(true);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h2>Enter your name to join</h2>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={handleLogin}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Chat Room</h2>
          <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid black' }}>
            {chat.map((msg, idx) => (
              <div key={idx}><strong>{msg.username}:</strong> {msg.message}</div>
            ))}
          </div>
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
          <button onClick={handleSend}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;


// === File: client/public/index.html ===
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>


// === File: client/src/index.js ===
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));


// === File: client/src/index.css ===
body {
  font-family: Arial, sans-serif;
  padding: 20px;
}
input {
  margin: 5px;
  padding: 5px;
}
button {
  padding: 5px 10px;
}


// === File: package.json (for server) ===
{
  "name": "chat-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}


// === File: client/package.json ===
{
  "name": "chat-client",
  "version": "1.0.0",
  "main": "src/index.js",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.2"
  },
  "scripts": {
    "start": "react-scripts start"
  }
}


// === Database (Optional SQL Table Structure) ===
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Messages table
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  content TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
