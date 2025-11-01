const express = require("express");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");
const routeGuard2 = require("../../middleware/verifyToken");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get(
  "/getAllOrderProvider/:provider_id",
  routeGuard2,
  async (req, res) => {
    const { provider_id } = req.params;
    // console.log(req.params);
    try {
      const response = await pool.query(
        `SELECT o.* ,   c.user_id   AS customer_user_id,
    c.firstname AS customer_firstname,
    c.lastname  AS customer_lastname,
    c.email     AS customer_email,
    c.role      AS customer_role,
    c.phone     AS customer_phone,
    c.profile_image AS customer_profile_image,
 cat.name AS categories_name,

    p_u.user_id   AS provider_user_id,
    p_u.firstname AS provider_firstname,
    p_u.lastname  AS provider_lastname,
    p_u.email     AS provider_email,
    p_u.role      AS provider_role,
    p_u.phone     AS provider_phone,
    p_u.profile_image AS provider_profile_image,
pr.product_id,
    pr.name           AS product_name,
    pr.description    AS product_description,
    pr.type_of_product,
    pr.location,
    pr.image          AS product_image,
    pr.category_id    AS product_category_id,
    p.provider_id,
    p.bio          AS provider_bio,
    p.skills       AS provider_skills
     from orders o inner join users c  on o.customer_id=c.user_id inner join providers p  on o.provider_id=p.provider_id INNER JOIN users p_u ON p.user_id = p_u.user_id  
      LEFT  JOIN products pr     ON o.product_id = pr.product_id
      LEFT JOIN categories cat     ON pr.category_id = cat.category_id

 where o.provider_id=$1;
       `,
        [provider_id]
      );

      const result1 = await pool.query(
        `

SELECT COUNT(*) 
FROM orders 
WHERE status IN ('pending', 'on_progress','awaiting_approval') and provider_id=$1 ;`,
        [provider_id]
      );
      const count = result1.rows[0].count;
      // console.log(count);

      res.json({
        orders: response.rows,
        ordersCount: Number(count),
      });

      // res.json(response.rows);
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
          "Something went wrong while fetching a quiry  in getAllOrderProvider router.",
      });
    }
  }
);
module.exports = router;
