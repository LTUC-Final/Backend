//routes/carts/addCustomRequirement.js
const express = require("express");
const pg = require("pg");
const cors = require("cors");

require("dotenv").config();
const router = express.Router();
router.use(cors());
router.use(express.json());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Customer adds custom requirement → status_pay = Unapprove
router.put("/changeStatusPay", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    const result = await pool.query(
      `UPDATE cart  set 
       status_pay = 'Unapprove' 
       WHERE cart_id = $1 AND customer_id = $2
       RETURNING *`,
      [cart_id, user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});

router.put("/updateTheCustomReqAndToOrder", async (req, res) => {
  try {
    const {
      cart_id,
      user_id,
      custom_requirement,
      price,
      Prodact_id,

      provider_id,
      quntity,
    } = req.body;
    const result = await pool.query(
      `UPDATE cart 
       SET custom_requirement = $1
       WHERE cart_id = $2 AND customer_id = $3
       RETURNING *`,
      [custom_requirement, cart_id, user_id]
    );

    const status = "awaiting_approval";
    const result1 = await pool.query(
      `INSERT INTO orders  
    (details_order_user, original_price, provider_id, product_id, quantity, customer_id,status,  cart_id
) 
   VALUES ($1, $2, $3, $4, $5, $6,$7,$8)
   RETURNING *;`,
      [
        custom_requirement,
        price,
        provider_id,
        Prodact_id,
        quntity,
        user_id,
        status,
        cart_id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});

//order
router.put("/updatePriceAndResponse/:order_id", async (req, res) => {
  try {
    const { response_from_provider, price } = req.body;
    const { order_id } = req.params;

    const result = await pool.query(
      `UPDATE orders 
       SET response_from_provider = $1,
           original_price = $2
       WHERE order_id = $3
       RETURNING *;`,
      [response_from_provider, price, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in updatePriceAndResponse:", err.message);
    res.status(500).json({ message: "Error updating order" });
  }
});

router.put("/sendResponseProviderToCart", async (req, res) => {
  try {
    const { cart_id, response_from_provider, original_price } = req.body;

    const result = await pool.query(
      `UPDATE cart 
set  provider_response=$2,price=$3
       WHERE cart_id = $1 
       RETURNING *`,
      [cart_id, response_from_provider, original_price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});

router.put("/changeStatusPayOfProdactAfterApprove", async (req, res) => {
  try {
    const { cart_id, user_id } = req.body;

    const result = await pool.query(
      `UPDATE cart set 
       status_pay = 'Approve' 
       WHERE cart_id = $1 AND customer_id = $2
       RETURNING *`,
      [cart_id, user_id]
    );

    const result1 = await pool.query(
      `DELETE FROM orders
       WHERE cart_id = $1
       RETURNING *;`,
      [cart_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in addCustomRequirement:", err.message);
    res.status(500).json({ message: "Error adding custom requirement" });
  }
});
router.put(
  "/changeStatusPayOfProdactAfterRejected/:cart_id",
  async (req, res) => {
    try {
      const { cart_id } = req.params;
      const status = "rejected";

      const result1 = await pool.query(
        `UPDATE orders
       SET status = $1
       WHERE cart_id = $2
       RETURNING *;`,
        [status, cart_id]
      );

      const result = await pool.query(
        `DELETE FROM cart
       WHERE cart_id = $1
       RETURNING *;`,
        [cart_id]
      );

      res.json({
        updatedOrder: result1.rows[0],
        deletedCart: result.rows[0],
      });
    } catch (err) {
      console.error(
        "Error in changeStatusPayOfProdactAfterRejected:",
        err.message
      );
      res
        .status(500)
        .json({ message: "Error updating status or deleting cart" });
    }
  }
);

router.post("/postItem", async (req, res) => {
  try {
    const {
      typeOfItem,
      name,
      image,
      description,
      category_id,
      provider_id,
      price,
      location,
    } = req.body;

    const response = await pool.query(
      `
  INSERT INTO products (provider_id,category_id,name,location,description,price,type_of_product,image
) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8
) RETURNING *;
       `,
      [
        provider_id,
        category_id,
        name,
        location,
        description,
        price,

        typeOfItem,
        image,
      ]
    );
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

router.post("/moveApprovedCartToOrders/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. اختيار كل عناصر cart التي status_pay = 'Approve'
    const cartItems = await pool.query(
      `SELECT * FROM cart WHERE customer_id = $1 AND status_pay = 'Approve'`,
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(404).json({ message: "No approved cart items found" });
    }

    const ordersInserted = [];

    // 2. نقل كل عنصر إلى orders
    for (const item of cartItems.rows) {
      const status = "pending"; // يمكن تغيير الحالة حسب المنطق
      const order = await pool.query(
        `INSERT INTO orders
          (details_order_user, original_price, provider_id, product_id, quantity, customer_id, status, cart_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *;`,
        [
          item.custom_requirement,
          item.price,
          item.provider_id,
          item.product_id,
          item.quantity,
          item.customer_id,
          status,
          item.cart_id,
        ]
      );
      ordersInserted.push(order.rows[0]);
    }

    res.json({ ordersCreated: ordersInserted });
  } catch (err) {
    console.error("Error in moveApprovedCartToOrders:", err.message);
    res
      .status(500)
      .json({ message: "Error moving approved cart items to orders" });
  }
});

module.exports = router;
