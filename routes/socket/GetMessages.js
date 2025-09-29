const express = require("express");
const route = express.Router();
const pg = require("pg")
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });


route.get("/getmessages", async (req, res) => {
    const { senderId, receiveId } = req.query;
    try {
        if (!senderId || !receiveId) {
            return res.status(400).json({ error: "senderId and receiveId are required" });
        }

        const result = await pool.query(
            `SELECT m.*, 
            u_sender.firstname AS sender_name, 
            u_receiver.firstname AS receiver_name
     FROM messages m
     JOIN users u_sender ON m.sender_id = u_sender.user_id
     JOIN users u_receiver ON m.receiver_id = u_receiver.user_id
     WHERE (m.sender_id=$1 AND m.receiver_id=$2) 
        OR (m.sender_id=$2 AND m.receiver_id=$1)
     ORDER BY m.created_at ASC`,
            [senderId, receiveId]
        );
        console.log(result.rows);

        res.json(result.rows);

    } catch (error) {
        console.log(error);

    }
})

module.exports = route;