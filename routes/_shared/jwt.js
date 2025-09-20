const jwt = require("jsonwebtoken");


function getToken(req) {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  }
  if (req.query && req.query.token) return req.query.token; 
  return null;
}


function signUserToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { getToken, signUserToken, verifyToken };
