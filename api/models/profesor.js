"use strict";
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define(
    "profesor",
    {
      nombre: DataTypes.STRING,
      id_carrera: DataTypes.INTEGER,
      id_materia: DataTypes.INTEGER,
    },
    {}
  );

  profesor.associate = function (models) {
    profesor.belongsTo(models.carrera, {
      as: "Carrera-Relacionada",
      foreignKey: "id_carrera",
    });
    profesor.belongsTo(models.materia, {
      as: "Materia_Relacionada",
      foreignKey: "id_materia",
    });
  };

  return profesor;
};
