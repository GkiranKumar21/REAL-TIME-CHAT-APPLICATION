const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React app URL
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

// In-memory message storage (replace with a database for production)
let messages = [];

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send message history to the newly connected client
    socket.emit('messageHistory', messages);

    // Handle incoming messages
    socket.on('sendMessage', (message) => {
        const messageData = {
            id: messages.length + 1,
            user: message.user || 'Anonymous',
            text: message.text,
            timestamp: new Date().toISOString(),
        };
        messages.push(messageData); // Store message
        io.emit('receiveMessage', messageData); // Broadcast to all clients
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic API endpoint for health check
app.get('/', (req, res) => {
    res.send('Chat server is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${ PORT }`);
});