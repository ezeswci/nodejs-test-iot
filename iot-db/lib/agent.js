'use strict'

module.exports = function setupAgent (AgentModel) {
  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }
    const existingAgent = await AgentModel.findOne(cond)
    if (existingAgent) {
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    }
    const result = await AgentModel.create(agent)
    return result.toJSON()
  }
  function findById (id) {
    return AgentModel.findById(id) // A function of sequelize model http://docs.sequelizejs.com/class/lib/model.js~Model.html
  }
  function findByUuid (uuid) {
    return AgentModel.findOne({
      where: {
        uuid
      }
    })
  }
  function findAll () {
    return AgentModel.findAll()
  }
  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }
  function findByUserName (username) {
    return AgentModel.findAll({
      where: {
        username
      }
    })
  }

  return {
    createOrUpdate,
    findByUuid,
    findById,
    findAll,
    findConnected,
    findByUserName
  }
}
