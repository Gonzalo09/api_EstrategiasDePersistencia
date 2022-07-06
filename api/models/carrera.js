"use strict";
module.exports = (sequelize, DataTypes) => {
  const carrera = sequelize.define(
    "carrera",
    {
      nombre: DataTypes.STRING,
      id_instituto: DataTypes.INTEGER,
    },
    {}
  );

  carrera.associate = function (models) {
    carrera.hasMany(models.materia, {
      as: "Materia",
      primaryKey: "id",
    });
    carrera.belongsTo(models.instituto, {
      as: "Instituto-Relacionado",
      foreignKey: "id_instituto",
    });
  };

  return carrera;
};
