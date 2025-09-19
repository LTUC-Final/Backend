require("dotenv").config();
const pg = require("pg");
const cors = require("cors");
const axios = require("axios");

const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const getUserProfile = require('./routes/customerProfile/getUserProfile.js');
app.use('/api/user', getUserProfile);

const updateUserProfile = require('./routes/customerProfile/updateUserProfile.js');
app.use('/api/user', updateUserProfile);

const getProviderProfile=require('./routes/providerProfile/getProviderProfile.js');
app.use('/api/provider',getProviderProfile);

const updateProviderProfile=require('./routes/providerProfile/updateProviderProfile.js');
app.use('/api/provider',updateProviderProfile);

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
        console.log(" Connected to DB:", res.rows[0]);

        console.log(
          `Connected to PostgreSQL as user '${dbUser}' on database '${dbName}'`
        );

        console.log(`App listening on port http://localhost:${port}`);
      });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`app listening on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Could not connect to database:", err);
  });
