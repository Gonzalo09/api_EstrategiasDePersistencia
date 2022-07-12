var jwt = require("jsonwebtoken");
require("dotenv").config("./.env");
const secret = process.env.SECRET;

function validateToken(req, res, next) {
  const accessToken = req.headers.authorization.split(" ")[1];
  if (!accessToken) res.send("acceso denegado");

  jwt.verify(accessToken, secret, (err, user) => {
    if (err) {
      res.send("acceso denegado, token expirado");
    } else {
      next();
    }
  });
}

module.exports.validateToken = validateToken;
