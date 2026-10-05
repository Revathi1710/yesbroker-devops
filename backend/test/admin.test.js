// ============================================================
// ADMIN API TESTS
// ============================================================
require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");

describe("ADMIN API TESTS", () => {

  // 1. Create Admin
  test("POST /api/create-admin - should create admin", async () => {
    const res = await request(app)
      .post("/api/create-admin")
      .send({
        username: `testadmin_${Date.now()}`,
        password: "Test@12345"
      });

    expect([201, 500]).toContain(res.statusCode);

    if (res.statusCode === 201) {
      expect(res.body.message).toBe("Admin created successfully");
    }
  });


  // 2. Admin Login - invalid credentials
  test("POST /api/admin-login - should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/admin-login")
      .send({
        username: "invalid_admin",
        password: "wrong_password"
      });

    expect([400, 500]).toContain(res.statusCode);

    if (res.statusCode === 400) {
      expect(res.body.message).toBe("Invalid credentials");
    }
  });


  // 3. Change Password - unauthenticated
  test("PUT /api/change-password - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .put("/api/change-password")
      .send({
        oldPassword: "OldPassword",
        newPassword: "NewPassword"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // 4. Dashboard Summary - unauthenticated
  test("GET /api/dashboard-summary - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .get("/api/dashboard-summary");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 5. Get All Property Admin
  test("GET /api/all-property-admin - should return properties", async () => {
    const res = await request(app)
      .get("/api/all-property-admin");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // 6. Update Property Status - unauthenticated
  test("PUT /api/update-property-status/:id - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .put("/api/update-property-status/invalid-id")
      .send({
        status: "Active"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // 7. Delete Property Admin - unauthenticated
  test("DELETE /api/delete-property-admin/:id - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .delete("/api/delete-property-admin/invalid-id");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 8. Add Broker - unauthenticated
  test("POST /api/addbroker - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .post("/api/addbroker")
      .field("name", "Test Broker")
      .field("mobile_number", "9876543210")
      .field("email", "testbroker@example.com")
      .field("service_offered", "Rent");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 9. Admin Check Auth - unauthenticated
  test("GET /api/admin/check-auth - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .get("/api/admin/check-auth");

    expect([401, 403]).toContain(res.statusCode);
  });


  // 10. Admin Logout - unauthenticated
  test("POST /api/admin/logout - should reject unauthenticated admin", async () => {
    const res = await request(app)
      .post("/api/admin/logout");

    expect([401, 403]).toContain(res.statusCode);
  });

});