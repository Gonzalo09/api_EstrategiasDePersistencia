"use strict";
module.exports = (sequelize, DataTypes) => {
  const instituto = sequelize.define(
    "instituto",
    {
      nombre: DataTypes.STRING,
    },
    {}
  );

  instituto.associate = function (models) {
    instituto.hasMany(models.carrera, {
      as: "Carrera",
      primaryKey: "id",
    });
  };

  return instituto;
};
