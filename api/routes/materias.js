var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.materia
    .findAll({
      attributes: ["id", "nombre", "id_carrera"],
      include: [
        {
          as: "Carrera-Relacionada",
          model: models.carrera,
          attributes: ["id", "nombre"],
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
    })
    .then((materias) => res.send(materias))
    .catch(() => res.sendStatus(500));
});

router.post("/", validador.validateToken, (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
    .then((materia) => res.status(201).send({ id: materia.id }))
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otra materia con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre", "id_carrera"],
      where: { id },
    })
    .then((materia) => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", validador.validateToken, (req, res) => {
  findmateria(req.params.id, {
    onSuccess: (materia) => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (materia) =>
    materia
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .update({ id_carrera: req.body.id_carrera }, { fields: ["id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res
            .status(400)
            .send("Bad request: existe otra materia con el mismo nombre");
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.delete("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (materia) =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

module.exports = router;
