'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let AgentStub = null
let db = null
let sandbox = null
let uuid = 'yyy-yyy-yyy'
let uuidArgs = {
  where: {
    uuid
  }
}
let connectedArgs = {
  where: {connected: true}
}
let usernameArgs = {
  where: { username: 'platzi' }
}
let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }
  // Model findOne
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  // Model create stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent } // Por que va a llamar a esta funcion arriba
  }))
  // Model update stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)))
  // Model findAll stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore() // Eqv: if (sandbox) sinon.sandbox.restore();
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

// Test serial as to do avoid posible parallel errors from setupDatabas
test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with id')

  t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})
test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid) // van estos await?

  t.true(AgentStub.findOne.called, 'findByUuid should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findByUuid should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findByUuid should be called with uuid')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'should be the same')
})
test.serial('Agent#findAll', async t => {
  let agent = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')

  t.deepEqual(agent, agentFixtures.all, 'should be the same')
})
test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findConnected should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findConnected should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findConnected should be called with connectedArgs')
  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same length of agentFixtures.connected')
  t.deepEqual(agents, agentFixtures.connected, 'should be the same')
})
test.serial('Agent#findByUserName', async t => {
  let agents = await db.Agent.findByUserName('platzi')

  t.true(AgentStub.findAll.called, 'findConnected should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findConnected should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findConnected should be called with usernameArgs')

  t.deepEqual(agents, agentFixtures.platzi, 'should be the same')
})
test.serial('Agent#createOrUpdate -- exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)
  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'agent should be the same')
})
test.serial('Agent#createOrUpdate -- new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)
  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.create.called, 'create should be called on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with newAgent')

  t.deepEqual(agent, newAgent, 'agent should be the same')
})
