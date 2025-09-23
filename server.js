require("dotenv").config();
const pg = require("pg");
const cors = require("cors");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json()); 

app.use(express.json());
const port = process.env.PORT;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
//hussam 
const reviews=require("./routes/InfoCardDetails/ReviewsProduct")
app.use("/api" , reviews )
const card=require("./routes/UserDashboard/ShowCardInUserDashboard")
app.use("/api" , card )
const cardPage=require("./routes/InfoCardDetails/DetailsOfCardInfo")
app.use("/api" , cardPage )
const cart=require("./routes/UserDashboard/AddCart")
app.use("/api" , cart )
const favPage=require("./routes/UserDashboard/AddFav")
app.use("/api" , favPage )
// jawhara 
const getUserProfile = require('./routes/customerProfile/getUserProfile.js');
app.use('/api/user', getUserProfile);

const updateUserProfile = require('./routes/customerProfile/updateUserProfile.js');
app.use('/api/user', updateUserProfile);

const getProviderProfile=require('./routes/providerProfile/getProviderProfile.js');
app.use('/api/provider',getProviderProfile);

const updateProviderProfile=require('./routes/providerProfile/updateProviderProfile.js');
app.use('/api/provider',updateProviderProfile);

//Omar

const postItem = require("./routes/orderRequest/postItem");
app.use("/", postItem);
const getAllCategory = require("./routes/orderRequest/getAllCategory");
app.use("/", getAllCategory);
const getAllOrderProvider = require("./routes/orderRequest/getAllOrderInProvider");
app.use("/", getAllOrderProvider);
const updatePriceOrderAndDetails = require("./routes/orderRequest/updatePriceOrderAndDetails");
app.use("/", updatePriceOrderAndDetails);
const updateStatusOrderCompleted = require("./routes/orderRequest/updateStatusOrderCompleted");
app.use("/", updateStatusOrderCompleted);

const updateStatusOrderRejected = require("./routes/orderRequest/updateStatusOrderRejected");
app.use("/", updateStatusOrderRejected);

const updateStatusOrderOn_progress = require("./routes/orderRequest/updateStatusOrderOn_progress");
app.use("/", updateStatusOrderOn_progress);

const customerWriteReviewOfProdactOrder = require("./routes/orderCustomer/customerWriteReviewOfProdactOrder");
app.use("/", customerWriteReviewOfProdactOrder);

const getAllOrderInCustomer = require("./routes/orderCustomer/getAllOrderInCustomer");
app.use("/", getAllOrderInCustomer);

const getProducts=require('./routes/providerProfile/getProducts.js');
app.use('/api/provider',getProducts);

const getProviderReviews=require('./routes/providerProfile/getProviderReviews.js');
app.use('/api/provider',getProviderReviews);

const deleteProduct = require('./routes/providerProfile/deleteProduct.js');
app.use('/api/provider',deleteProduct);

const updateProduct = require('./routes/providerProfile/updateProduct.js');
app.use('/api/provider',updateProduct);

const addReview = require('./routes/providerProfile/addProviderReview.js');
app.use('/api/provider',addReview);






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


app.use("/api/orders", addToOrder);


//app.use- payments
app.use("/api/payments", getPaymentsByUser);  // Get payments by user_id
app.use("/api/payments", getPaymentsSummary); // Get payments summary by user_id
app.use("/api/payments", addPayment);
app.use("/api/payments", updatePaymentStatus);



app.use((req, res) => {
  res.status(404).send("Page not fond <a href='/'>back to home </a>");
});

pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT current_database(), current_user")
      .then((res) => {
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