require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.post("/addfav", async (req, res) => {
    const { customer_id, product_id } = req.body;
    try {
        const check = await pool.query("SELECT * FROM wishlist WHERE product_id=$1 AND customer_id=$2 ", [product_id, customer_id])

        if (check.rows.length > 0) {
            await pool.query("DELETE FROM wishlist WHERE product_id=$1 AND customer_id=$2", [product_id, customer_id])
            return res.send("Product deleted from favourites")
        } else {
            await pool.query(`INSERT INTO wishlist (customer_id, product_id) 
         VALUES ($1, $2)`,
                [customer_id, product_id]
            )
        }

        return res.send("Product added to favourites")
    } catch (error) {
        console.error(
            "Error fetching  quiry  in getAllOrderProvider router:",
            error.message
        );
        let obj = {
            error: "somthing habpend",
        };
        res.status(500).json({
            error:
                "Something went wrong while fetching a quiry  in getAllOrderProvider router.",
        });
    }

})
module.exports = route;