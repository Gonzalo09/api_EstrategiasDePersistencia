var express = require("express");
var router = express.Router();
var models = require("../models");
var validador = require("./validador");

router.get("/", validador.validateToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  models.alumno
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
    .then((alumnos) => res.send(alumnos))
    .catch(() => res.sendStatus(500));
});

router.post("/", validador.validateToken, (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera })
    .then((alumno) => res.status(201).send({ id: alumno.id }))
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otra alumno con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre", "id_carrera"],
      include: [
        {
          as: "Carrera-Relacionada",
          model: models.carrera,
          attributes: ["id", "nombre"],
        },
      ],
      where: { id },
    })
    .then((alumno) => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", validador.validateToken, (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: (alumno) => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.put("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (alumno) =>
    alumno
      .update(
        { nombre: req.body.nombre, id_carrera: req.body.id_carrera },
        { fields: ["nombre", "id_carrera"] }
      )
      .then(() => res.sendStatus(200))
      .catch((error) => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res
            .status(400)
            .send("Bad request: existe otra alumno con el mismo nombre");
        } else {
          console.log(
            `Error al intentar actualizar la base de datos: ${error}`
          );
          res.sendStatus(500);
        }
      });
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

router.delete("/:id", validador.validateToken, (req, res) => {
  const onSuccess = (alumno) =>
    alumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500),
  });
});

module.exports = router;
