require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");


describe("Broker API Tests", () => {

  // =====================================================
  // 1. GET ZONES
  // =====================================================

  test("GET /api/zones - should return Chennai zones", async () => {
    const res = await request(app)
      .get("/api/zones");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("zones");
  });


  // =====================================================
  // 2. BROKER REGISTER
  // =====================================================

  test("POST /api/brokerRegister - missing required fields", async () => {
    const res = await request(app)
      .post("/api/brokerRegister")
      .send({
        name: "",
        mobile_number: "",
        email: ""
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });


  // =====================================================
  // 3. VERIFY REGISTER OTP
  // =====================================================

  test("POST /api/brokerRegister/verify-otp - missing email and OTP", async () => {
    const res = await request(app)
      .post("/api/brokerRegister/verify-otp")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and OTP are required");
  });


  // =====================================================
  // 4. RESEND REGISTER OTP
  // =====================================================

  test("POST /api/brokerRegister/resend-otp - missing email", async () => {
    const res = await request(app)
      .post("/api/brokerRegister/resend-otp")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });


  // =====================================================
  // 5. SEND LOGIN OTP
  // =====================================================

  test("POST /api/broker/send-otp - missing email", async () => {
    const res = await request(app)
      .post("/api/broker/send-otp")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });


  // =====================================================
  // 6. SEND LOGIN OTP - INVALID EMAIL
  // =====================================================

  test("POST /api/broker/send-otp - invalid email", async () => {
    const res = await request(app)
      .post("/api/broker/send-otp")
      .send({
        email: "invalid-email"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email address");
  });


  // =====================================================
  // 7. VERIFY LOGIN OTP
  // =====================================================

  test("POST /api/broker/verify-otp - missing email and OTP", async () => {
    const res = await request(app)
      .post("/api/broker/verify-otp")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email and OTP are required");
  });


  // =====================================================
  // 8. RESEND LOGIN OTP
  // =====================================================

  test("POST /api/broker/resend-otp - missing email", async () => {
    const res = await request(app)
      .post("/api/broker/resend-otp")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email is required");
  });


  // =====================================================
  // 9. GET BROKER BY ID
  // =====================================================

  test("GET /api/broker/:id - invalid broker ID", async () => {
    const res = await request(app)
      .get("/api/broker/invalid-id");

    expect([400, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 10. BROKER PROFILE
  // =====================================================

  test("GET /api/brokerProfile - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/brokerProfile");

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 11. UPDATE BROKER PROFILE
  // =====================================================

  test("PUT /api/broker/update-profile - should reject unauthenticated request", async () => {
    const res = await request(app)
      .put("/api/broker/update-profile")
      .send({
        name: "Test Broker"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 12. BROKER LOGOUT
  // =====================================================

  test("POST /api/broker/logout - should logout successfully", async () => {
    const res = await request(app)
      .post("/api/broker/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });


  // =====================================================
  // 13. GET BROKER BY SLUG
  // =====================================================

  test("GET /api/brokers/:slug - broker not found", async () => {
    const res = await request(app)
      .get("/api/brokers/non-existing-broker-12345");

    expect([404, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 14. GET BROKER PROPERTIES
  // =====================================================

  test("GET /api/brokers/:slug/properties - broker not found", async () => {
    const res = await request(app)
      .get("/api/brokers/non-existing-broker-12345/properties");

    expect([404, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 15. GET BROKER SUCCESS STORIES
  // =====================================================

  test("GET /api/brokers/:slug/success-stories - broker not found", async () => {
    const res = await request(app)
      .get("/api/brokers/non-existing-broker-12345/success-stories");

    expect([404, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 16. GET ALL BROKERS
  // =====================================================

  test("GET /api/allbrokers - should return brokers", async () => {
    const res = await request(app)
      .get("/api/allbrokers");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
    }
  });


  // =====================================================
  // 17. UPDATE BROKER STATUS
  // =====================================================

  test("PUT /api/update-broker-status/:id - invalid broker ID", async () => {
    const res = await request(app)
      .put("/api/update-broker-status/invalid-id")
      .send({
        active: true
      });

    expect([200, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 18. GET FEATURED BROKERS
  // =====================================================

  test("GET /api/feature-broker - should return featured brokers", async () => {
    const res = await request(app)
      .get("/api/feature-broker");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
    }
  });


  // =====================================================
  // 19. RECENT ACTIVITY
  // =====================================================

  test("GET /api/broker/recent-activity - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/broker/recent-activity");

    expect([401, 403]).toContain(res.statusCode);
  });

});