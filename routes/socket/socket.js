
const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"]
    }
});


const users = {};
io.users = users;

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("register", (userId) => {
        users[userId] = socket.id;
        console.log(`userID ${userId} with socketID ${socket.id}`);
    });

    socket.on("send-message", (data) => {
        const { senderId, receiveId, text  , time } = data;
        const receiverSocket = users[receiveId];
        console.log(data);

        if (receiverSocket) {
            io.to(receiverSocket).emit("receive_message", { senderId, receiveId, text, time });

        }
        console.log(receiveId);


    });

    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) delete users[userId];
        }
    });
});

module.exports = io;

