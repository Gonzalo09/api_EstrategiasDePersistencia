var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.carrera
    .findAll({
      attributes: ["id", "nombre", "id_instituto"],
      include: [
        {
          as: "Instituto-Relacionado",
          model: models.instituto,
          attributes: ["id", "nombre"],
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
    })
    .then((carreras) => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

router.post("/", validador.validateToken, (req, res) => {
  models.carrera
    .create({ nombre: req.body.nombre, id_instituto: req.body.id_instituto })
    .then((carrera) => res.status(201).send({ id: carrera.id }))
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otra carrera con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre", "id_instituto"],
      where: { id },
    })
    .then((carrera) => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", validador.validateToken, (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: (carrera) => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (carrera) =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .update(
        { id_instituto: req.body.id_instituto },
        { fields: ["id_instituto"] }
      )
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res
            .status(400)
            .send("Bad request: existe otra carrera con el mismo nombre");
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.delete("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (carrera) =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

module.exports = router;
