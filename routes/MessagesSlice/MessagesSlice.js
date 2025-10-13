const express = require('express');
const route = express.Router();

const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.get('/Messages', async (req, res) => {
    const {userId}  = req.query;
    console.log(userId);
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    try {
        const result = await pool.query(`
      SELECT DISTINCT ON (LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id))
        m.message_id,
        m.sender_id,
s.firstname || ' ' || s.lastname AS sender_name,
        m.receiver_id,
         r.firstname || ' ' || r.lastname AS receiver_name,
        m.text,
        m.created_at
      FROM messages AS m
      JOIN users AS s ON m.sender_id = s.user_id
      JOIN users AS r ON m.receiver_id = r.user_id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY LEAST(m.sender_id, m.receiver_id),
               GREATEST(m.sender_id, m.receiver_id),
               m.created_at DESC;
    `, [userId])
        res.json(result.rows)
    } catch (error) {
       console.error('Error in /Messages route:', error);
    res.status(500).json({ error: error.message });


    }



})

module.exports = route;