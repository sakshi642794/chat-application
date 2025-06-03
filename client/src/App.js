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


