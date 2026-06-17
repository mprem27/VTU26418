const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Record = sequelize.define("Record", {
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  }
});

module.exports = Record;