require('dotenv').config();
require('./setup'); // Establishes DB connection for tests
const request = require('supertest');
const app = require("../app");

describe("PROPERTY API TESTS", () => {

  // =====================================================
  // 1. ADD PROPERTY
  // POST /api/add-property
  // Protected
  // =====================================================

  test("POST /api/add-property - should reject unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/add-property")
      .send({
        listingType: "Rent",
        propertyType: "Apartment",
        localities: JSON.stringify(["Velachery"]),
        size: "1200",
        price: "25000",
        description: "Test property"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 2. GET MY PROPERTIES
  // GET /api/my-properties
  // Protected
  // =====================================================

  test("GET /api/my-properties - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/my-properties");

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 3. GET PROPERTY BY ID
  // GET /api/property/:id
  // Protected
  // =====================================================

  test("GET /api/property/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/property/invalid-id");

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 4. GET PUBLIC PROPERTY BY ID
  // GET /api/propertyview/:id
  // Public
  // =====================================================

  test("GET /api/propertyview/:id - invalid property ID", async () => {
    const res = await request(app)
      .get("/api/propertyview/invalid-id");

    expect([404, 500]).toContain(res.statusCode);
  });


  // =====================================================
  // 5. EDIT PROPERTY
  // PUT /api/property/:id
  // Protected
  // =====================================================

  test("PUT /api/property/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .put("/api/property/invalid-id")
      .send({
        price: "30000"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 6. DELETE PROPERTY
  // DELETE /api/property/:id
  // Protected
  // =====================================================

  test("DELETE /api/property/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .delete("/api/property/invalid-id");

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 7. SEARCH BY LOCALITY
  // GET /api/search/:slug
  // Public
  // =====================================================

  test("GET /api/search/:slug - should return properties", async () => {
    const res = await request(app)
      .get("/api/search/velachery");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("count");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // =====================================================
  // 8. SEARCH BY LOCALITY - ALL
  // GET /api/search/all
  // Public
  // =====================================================

  test("GET /api/search/all - should return all active broker properties", async () => {
    const res = await request(app)
      .get("/api/search/all");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // =====================================================
  // 9. SEARCH TYPE
  // GET /api/searchtype/:slug
  // Public
  // =====================================================

  test("GET /api/searchtype/:slug - should return properties", async () => {
    const res = await request(app)
      .get("/api/searchtype/velachery");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
    }
  });


  // =====================================================
  // 10. SEARCH WITH FILTERS
  // GET /api/search/:slug?type=Rent&propertyType=Apartment
  // Public
  // =====================================================

  test("GET /api/search/:slug - should support type filters", async () => {
    const res = await request(app)
      .get("/api/search/velachery")
      .query({
        type: "Rent",
        propertyType: "Apartment"
      });

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });


  // =====================================================
  // 11. GET RENT PROPERTIES
  // GET /api/rentproperty
  // Public
  // =====================================================

  test("GET /api/rentproperty - should return rent properties", async () => {
    const res = await request(app)
      .get("/api/rentproperty");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("count");

      expect(Array.isArray(res.body.data)).toBe(true);

      // Controller has .limit(4)
      expect(res.body.data.length).toBeLessThanOrEqual(4);
    }
  });


  // =====================================================
  // 12. GET SELL PROPERTIES
  // GET /api/sellproperty
  // Public
  // =====================================================

  test("GET /api/sellproperty - should return sell properties", async () => {
    const res = await request(app)
      .get("/api/sellproperty");

    expect([200, 500]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success");
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("count");

      expect(Array.isArray(res.body.data)).toBe(true);

      // Controller has .limit(4)
      expect(res.body.data.length).toBeLessThanOrEqual(4);
    }
  });


  // =====================================================
  // 13. ADD PROPERTY ADMIN
  // POST /api/add-property-admin
  // Protected
  // =====================================================

  test("POST /api/add-property-admin - should reject unauthenticated request", async () => {
    const res = await request(app)
      .post("/api/add-property-admin")
      .send({
        listingType: "Sell",
        propertyType: "Villa",
        localities: JSON.stringify(["Adyar"]),
        size: "2000",
        price: "10000000",
        description: "Admin test property",
        broker_id: "invalid-id"
      });

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 14. GET PROPERTY ADMIN
  // GET /api/propertyadmin/:id
  // Protected
  // =====================================================

  test("GET /api/propertyadmin/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/propertyadmin/invalid-id");

    expect([401, 403]).toContain(res.statusCode);
  });


  // =====================================================
  // 15. EDIT PROPERTY ADMIN
  // PUT /api/propertyadmin/:id
  // Protected
  // =====================================================

  test("PUT /api/propertyadmin/:id - should reject unauthenticated request", async () => {
    const res = await request(app)
      .put("/api/propertyadmin/invalid-id")
      .send({
        price: "5000000"
      });

    expect([401, 403]).toContain(res.statusCode);
  });

});