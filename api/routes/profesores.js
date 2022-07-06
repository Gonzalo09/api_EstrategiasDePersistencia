var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.profesor
    .findAll({
      attributes: ["id", "nombre", "id_carrera", "id_materia"],
      include: [
        {
          as: "Carrera-Relacionada",
          model: models.carrera,
          attributes: ["id", "nombre"],
        },
        {
          as: "Materia_Relacionada",
          model: models.materia,
          attributes: ["id", "nombre"],
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
    })
    .then((profesores) => res.send(profesores))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.profesor
    .create({
      nombre: req.body.nombre,
      id_carrera: req.body.id_carrera,
      id_materia: req.body.id_materia,
    })
    .then((profesor) => res.status(201).send({ id: profesor.id }))
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otra profesor con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

const findprofesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne({
      attributes: ["id", "nombre"],
      include: [
        {
          as: "Carrera-Relacionada",
          model: models.carrera,
          attributes: ["id", "nombre"],
        },
        {
          as: "Materia_Relacionada",
          model: models.materia,
          attributes: ["id", "nombre"],
        },
      ],
      where: { id },
    })
    .then((profesor) => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findprofesor(req.params.id, {
    onSuccess: (profesor) => res.send(profesor),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = (profesor) =>
    profesor
      .update(
        {
          nombre: req.body.nombre,
          id_carrera: req.body.id_carrera,
          id_materia: req.body.id_materia,
        },
        { fields: ["nombre", "id_carrera", "id_materia"] }
      )
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res
            .status(400)
            .send("Bad request: existe otra profesor con el mismo nombre");
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  findprofesor(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = (profesor) =>
    profesor
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findprofesor(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

module.exports = router;
