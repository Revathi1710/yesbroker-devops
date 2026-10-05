const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { connectDb } = require("../db/connectDb");

dotenv.config();

beforeAll(async () => {
  // Connect to the DB before running tests
  await connectDb();
});

afterAll(async () => {
  // Gracefully close connection so Jest exits cleanly without open handles
  await mongoose.connection.close();
});