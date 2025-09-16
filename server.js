require("dotenv").config();
const pg = require("pg");
const cors = require("cors");
const axios = require("axios");

const express = require("express");
const app = express();
app.use(cors());

const port = process.env.PORT;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const postItem = require("./routes/postItem");
app.use("/", postItem);
const getAllCategory = require("./routes/getAllCategory");
app.use("/", getAllCategory);
const getAllOrderProvider = require("./routes/getAllOrderInProvider");
app.use("/", getAllOrderProvider);
const updatePriceOrderAndDetails = require("./routes/updatePriceOrderAndDetails");
app.use("/", updatePriceOrderAndDetails);
const updateStatusOrder = require("./routes/updateStatusOrder");
app.use("/", updateStatusOrder);

const customerWriteReviewOfProdactOrder = require("./routes/customerWriteReviewOfProdactOrder");
app.use("/", customerWriteReviewOfProdactOrder);
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
