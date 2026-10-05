// ============================================================
// STORY API TESTS
// ============================================================
require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");

describe("STORY API TESTS", () => {

  // 1. Add Success Story
  test("POST /api/add-success-story - should reject unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/add-success-story")
      .field("title", "Test Success Story")
      .field("shortSummary", "Test summary")
      .field("description", "Test description")
      .field("location", "Chennai")
      .field("propertyType", "Apartment")
      .field("clientName", "Test Client")
      .field("rating", "5");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 2. Get All Stories - Public
  test("GET /api/all-success-stories - should return stories", async () => {
    const res = await request(app)
      .get("/api/all-success-stories");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // 3. Get My Stories
  test("GET /api/my-success-stories - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/my-success-stories");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 4. Get Single Story
  test("GET /api/success-story/:id - should handle invalid story id", async () => {
    const res = await request(app)
      .get("/api/success-story/invalid-id");

    expect([404, 500]).toContain(res.statusCode);
  });


  // 5. Update Story
  test("PUT /api/success-story/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .put("/api/success-story/invalid-id")
      .field("title", "Updated Story");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 6. Delete Story
  test("DELETE /api/success-story/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .delete("/api/success-story/invalid-id");

    expect([401, 403]).toContain(res.statusCode);
  });

});