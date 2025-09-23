const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.post("/customerWriteReviewOfProdactOrder", async (req, res) => {
  try {
    const {
      product_id,
      customer_id,
      rating,
      review_text,
      provider_id,
      add_customer_review,
      order_id,
    } = req.body;
    console.log(order_id + "Ssssssssssssssssssssssssssss");
    const response = await pool.query(
      `
  INSERT INTO reviews (product_id, customer_id, rating, review_text
) VALUES (
    $1,$2,$3,$4
) RETURNING *;
       `,
      [product_id, customer_id, rating, review_text]
    );
    const response1 = await pool.query(
      `
update  orders set add_customer_review=true where order_id=$1  RETURNING *;
       `,
      [order_id]
    );

    //         const response1 = await pool.query(
    //       `
    //   INSERT INTO reviews_provider ( customer_id, rating, review_text,provider_id
    // ) VALUES (
    //     $1,$2,$3,$4
    // ) RETURNING *;
    //        `,
    //       [ customer_id, rating, review_text,provider_id]
    //     );
    res.json(response.rows[0]);
  } catch (error) {
    console.error("Error fetching  quiry :", error.message);
    let obj = {
      error: "somthing habpend  ",
    };
    res.status(500).json({
      error: "Something went wrong while fetching a quiry.",
    });
  }
});
module.exports = router;
