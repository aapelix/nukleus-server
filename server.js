const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: "*",
    }
});

let players = {};
const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'];

// Serve static files (your PhaserJS game)
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A player connected: ', socket.id);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    players[socket.id] = { 
        pos: [250, 250], angle: 0, velocity: 0, color: randomColor
    };

    // Send the current players' state to the new player
    socket.emit('init', players);

    // Listen for movement updates from this player
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data };
        }

        // Broadcast updated player data to all clients
        io.emit('update', players);
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('A player disconnected: ', socket.id);
        delete players[socket.id];
        io.emit('update', players); // Broadcast updated player list
    });
});

// Set the port (Render will set process.env.PORT automatically)
const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
