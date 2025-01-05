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

io.on('connection', (socket) => {
    console.log('A player connected: ', socket.id);

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    players[socket.id] = { 
        pos: [250, 250], angle: 0, velocity: 0, color: randomColor, vehicle: Math.random() < 0.1 ? "tank" : "car", turretAngle: 0 
    };

    socket.emit('init', players);

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id] = { ...players[socket.id], ...data };
        }

        io.emit('update', players);
    });

    socket.on('collision', (collisionData) => {
        // Broadcast collision to all players
        io.emit('collision', collisionData);
    });


    socket.on('disconnect', () => {
        console.log('A player disconnected: ', socket.id);
        delete players[socket.id];

        io.emit("player-disconnect", socket.id)

        io.emit('update', players);
    });
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
