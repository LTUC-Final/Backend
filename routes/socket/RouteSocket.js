const { Server } = require("socket.io");
const pg = require("pg");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const express = require("express");
const route = express.Router();

const io = require("./socket");
route.post("/send-messages", async (req, res) => {
    const { senderId, receiveId, text } = req.body;
    if (!senderId || !receiveId || !text) {
        return res.status(400).json({ error: "senderId, receiveId, and text are required" });
    }
    try {
        await pool.query("INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)",
            [senderId, receiveId, text]); const receiverSocket = io.users[receiveId];
        if (receiverSocket) { io.to(receiverSocket).emit("receive_message", { senderId, text, time: new Date().toISOString() }); }
        res.json({ success: true, message: "Message sent" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});
module.exports = route;
