const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
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
        pos: [250, 250], angle: 0, velocity: 0, color: randomColor};

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

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});