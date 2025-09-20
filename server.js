require("dotenv").config();
const pg = require("pg");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json()); 

const port = process.env.PORT || 4000;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });


const getCartProducts = require("./routes/cart/getCartProducts");
const getCartSummary = require("./routes/cart/getCartSummary");
const incrementQuantity = require("./routes/cart/incrementQuantity");
const decrementQuantity = require("./routes/cart/decrementQuantity");
const removeFromCart = require("./routes/cart/removeFromCart");



// Payments routes
const getPaymentsByUser = require("./routes/payments/getPaymentsByUser");
const getPaymentsSummary = require("./routes/payments/getPaymentsSummary");
const addPayment = require("./routes/payments/addPayment");
const updatePaymentStatus = require("./routes/payments/updatePaymentStatus");



//app.use- carts
app.use("/api/carts/products", getCartProducts);   // Get cart products by user_id

app.use("/api/carts/summary", getCartSummary);     // Get cart summary by user_id
app.use("/api/carts/increment", incrementQuantity);
app.use("/api/carts/decrement", decrementQuantity);
app.use("/api/carts/item", removeFromCart);
      // Clear cart




//app.use- payments
app.use("/api/payments", getPaymentsByUser);  // Get payments by user_id
app.use("/api/payments", getPaymentsSummary); // Get payments summary by user_id
app.use("/api/payments", addPayment);
app.use("/api/payments", updatePaymentStatus);




// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found <a href='/'>Back to home</a>");
});

pool
  .connect()
  .then((client) => {
    return client.query("SELECT current_database(), current_user").then((res) => {
      client.release();

      const dbName = res.rows[0].current_database;
      const dbUser = res.rows[0].current_user;
      console.log(` Connected to PostgreSQL as user '${dbUser}' on database '${dbName}'`);
    });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(` Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(" Could not connect to database:", err.message);
  });