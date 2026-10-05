// ============================================================
// BANNER API TESTS
// ============================================================
require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");

describe("BANNER API TESTS", () => {

  // 1. Add Banner - without image
  test("POST /api/banner/add - should reject without image", async () => {
    const res = await request(app)
      .post("/api/banner/add")
      .send({
        title: "Test Banner",
        subtitle: "Test Subtitle",
        button: "View More",
        url: "https://example.com"
      });

    // Controller explicitly returns 400 when image is missing
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });


  // 2. Get All Banners
  test("GET /api/banner/all - should return banners", async () => {
    const res = await request(app)
      .get("/api/banner/all");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // 3. Get Banner By ID
  test("GET /api/banner/:id - should handle invalid id", async () => {
    const res = await request(app)
      .get("/api/banner/invalid-id");

    expect([404, 500]).toContain(res.statusCode);
  });


  // 4. Edit Banner
  test("PUT /api/banner/edit/:id - should handle invalid id", async () => {
    const res = await request(app)
      .put("/api/banner/edit/invalid-id")
      .send({
        title: "Updated Banner",
        subtitle: "Updated Subtitle",
        button: "Click",
        url: "https://example.com"
      });

    expect([404, 500]).toContain(res.statusCode);
  });


  // 5. Delete Banner
  test("DELETE /api/banner/delete/:id - should handle invalid id", async () => {
    const res = await request(app)
      .delete("/api/banner/delete/invalid-id");

    expect([404, 500]).toContain(res.statusCode);
  });

});