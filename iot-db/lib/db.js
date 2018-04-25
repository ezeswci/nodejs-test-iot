'use strict'

const Sequelize = require('sequelize')
let sequelize = null

// The singleton pattern is a software design pattern that restricts the instantiation of a class to one object.
module.exports = function setupDatabase (config) {
  if (!sequelize) {
    sequelize = new Sequelize(config)
  }
  return sequelize
}
