const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

// spin up an in-memory mongo before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

// wipe collections between tests so they don't bleed into each other
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})