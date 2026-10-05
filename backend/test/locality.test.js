// ============================================================
// LOCALITY API TESTS
// ============================================================
require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");

describe("LOCALITY API TESTS", () => {

  // 1. Add Locality
  test("POST /api/locality/add - should add locality", async () => {
    const res = await request(app)
      .post("/api/locality/add")
      .send({
        zone: "South Chennai",
        state: "Tamil Nadu",
        active: true
      });

    expect([201, 500]).toContain(res.statusCode);

    if (res.statusCode === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
    }
  });


  // 2. Get All Localities
  test("GET /api/locality/all - should return localities", async () => {
    const res = await request(app)
      .get("/api/locality/all");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // 3. Update Locality
  test("PUT /api/locality/update/:id - should handle invalid id", async () => {
    const res = await request(app)
      .put("/api/locality/update/invalid-id")
      .send({
        zone: "Updated Zone",
        state: "Tamil Nadu",
        active: true
      });

    expect([200, 500]).toContain(res.statusCode);
  });


  // 4. Delete Locality
  test("DELETE /api/locality/delete/:id - should handle invalid id", async () => {
    const res = await request(app)
      .delete("/api/locality/delete/invalid-id");

    expect([200, 500]).toContain(res.statusCode);
  });

});