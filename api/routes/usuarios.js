var express = require("express");
var router = express.Router();
var models = require("../models");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
require("dotenv").config("./.env");
const secret = process.env.SECRET;
const expireIn = process.env.EXPIRESIN;

router.get("/", (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.usuario
    .findAll({
      attributes: ["id", "usuario", "password"],
      offset: (page - 1) * limit,
      limit: limit,
    })
    .then((usuarios) => res.send(usuarios))
    .catch(() => res.sendStatus(500));
});

router.delete("/:usuario", (req, res) => {
  models.usuario
    .destroy({
      where: {
        usuario: req.params.usuario,
      },
    })
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

// Crear un usuario
router.post("/signup", (req, res) => {
  let password = bcrypt.hashSync(req.body.password, 10);

  models.usuario
    .create({ usuario: req.body.usuario, password: password })
    .then((usuario) => {
      let token = jwt.sign({ id: usuario.id }, secret, { expiresIn: expireIn });
      res.json({
        ok: true,
        usuario: usuario,
        token: token,
      });
    })
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send("Existe otro usuario con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

//Consultar un usuario
router.post("/signin", (req, res) => {
  models.usuario
    .findOne({
      attributes: ["id", "usuario", "password"],
      where: { usuario: req.body.usuario },
    })
    .then((usuario) => {
      if (usuario) {
        if (bcrypt.compareSync(req.body.password, usuario.password)) {
          let token = jwt.sign({ usuario: usuario }, secret, {
            expiresIn: expireIn,
          });
          res.json({
            usuario: usuario,
            token: token,
          });
        } else {
          res.status(400).send("Password incorrecta");
        }
      } else {
        res.status(400).send("Usuario inexistente");
      }
    });
});

module.exports = router;
