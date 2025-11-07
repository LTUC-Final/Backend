require("dotenv").config();
const jwt = require("jsonwebtoken");

function routeGuard2(req, res, next) {
  const authHeader = req.headers["authorization"];
  const tokenFromHeader = authHeader && authHeader.split(" ")[1];
  const tokenFromQuery = req.query.token;
  const token = tokenFromHeader || tokenFromQuery;

  // console.log("dddddddddddddddddddddddddddddddddddd" + token);
  if (!token) {
    return res.status(401).json({ message: "the token not exist " });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "the token expire " });
    }

    req.user = decoded;
    next();
  });
}

module.exports = routeGuard2;
