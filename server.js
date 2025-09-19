require("dotenv").config();
const pg = require("pg");
const cors = require("cors");
const axios = require("axios");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const registerRoute = require("./routes/register/register");
const forgotRoute = require("./routes/forgetpassword/forgot");
const verifyOtpRoute = require("./routes/forgetpassword/verify_otp");
const resetPasswordRoute = require("./routes/forgetpassword/reset_password");
const loginRoute = require("./routes/login/login");
const logoutRoute = require("./routes/login/logout");
const wishlistRoute = require("./routes/wishlist/getAll");

app.use("/api", registerRoute);
app.use("/api", forgotRoute);
app.use("/api", verifyOtpRoute);
app.use("/api", resetPasswordRoute);
app.use("/api", loginRoute);
app.use("/api", logoutRoute);
app.use("/api", wishlistRoute);

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
        console.log(`Connected to PostgreSQL as user '${dbUser}' on database '${dbName}'`);
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

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

module.exports = { app, pool };
