"use strict";
module.exports = (sequelize, DataTypes) => {
  const usuario = sequelize.define(
    "usuario",
    {
      usuario: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {}
  );
  usuario.associate = function (models) {
    // associations can be defined here
  };
  return usuario;
};
