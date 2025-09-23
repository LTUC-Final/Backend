require("dotenv").config();
const pg = require("pg");
const express = require("express");
const route = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

route.post("/AddCart", async (req, res) => {
    const { customer_id, provider_id, details_order_user, product_id, quantity, price } = req.body;
    
    try {
        const check = await pool.query("SELECT * FROM cart WHERE product_id=$1 AND customer_id=$2 ", [product_id, customer_id])

        if (check.rows.length > 0) {
            await pool.query("DELETE FROM cart WHERE product_id=$1 AND customer_id=$2", [product_id, customer_id])
            return res.send("Product deleted from cart")
        } else {
            await pool.query(`INSERT INTO cart (customer_id, provider_id, details_order_user, product_id, quantity ,price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [customer_id, provider_id, details_order_user, product_id, quantity, price]
            )
        }

        return res.send("card added")
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