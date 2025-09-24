require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.get("/DetailsOfCardInfo/:id", async (req, res) => {
    const cardId = req.params.id;
    if (isNaN(cardId)) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    try {
        const dataCard = await pool.query(
            `SELECT s.product_id, s.provider_id,u.firstname,u.role,u.lastname,u.profile_image, c.category_id,c.name , c.description, s.name, s.location, s.description, s.price, s.type_of_product, s.image
        FROM products s
        LEFT JOIN categories c ON c.category_id = s.category_id
        JOIN providers p ON p.provider_id = s.provider_id
        JOIN users u ON u.user_id = p.user_id
        WHERE s.product_id = $1 `,
            [cardId]
        );


        if (dataCard.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(dataCard.rows[0])
    } catch (error) {
        console.error(
            "Error fetching  quiry  in getAllOrderProvider router:",
            error.message
        );
        let obj = {
            error: "somthing habpend  ",
        };
        res.status(500).json({
            error:
                "Something went wrong while fetching a quiry.",
        });
    }

})
module.exports = route;