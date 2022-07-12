var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.instituto
    .findAll({
      attributes: ["id", "nombre"],
      offset: (page - 1) * limit,
      limit: limit,
    })
    .then((institutos) => res.send(institutos))
    .catch(() => res.sendStatus(500));
});

router.post("/", validador.validateToken, (req, res) => {
  models.instituto
    .create({ nombre: req.body.nombre })
    .then((instituto) => res.status(201).send({ id: instituto.id }))
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otro instituto con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

const findinstituto = (id, { onSuccess, onNotFound, onError }) => {
  models.instituto
    .findOne({
      attributes: ["id", "nombre"],
      where: { id },
    })
    .then((instituto) => (instituto ? onSuccess(instituto) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", validador.validateToken, (req, res) => {
  findinstituto(req.params.id, {
    onSuccess: (instituto) => res.send(instituto),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (instituto) =>
    instituto
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res
            .status(400)
            .send("Bad request: existe otro instituto con el mismo nombre");
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  findinstituto(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.delete("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (instituto) =>
    instituto
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findinstituto(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

module.exports = router;
