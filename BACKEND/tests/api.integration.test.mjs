import request from "supertest";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import app from "../src/app.js";
import prisma from "../src/models/prisma/client.js";

const uniqueSuffix = Date.now();
const testUser = {
  name: "API Test User",
  email: `apitest-${uniqueSuffix}@traveloop.local`,
  password: "password123",
  language: "en"
};

let accessToken = "";
let refreshToken = "";
let tripId = "";
let stopId = "";
let cityId = "";

const ensureAuthTables = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id CHAR(36) NOT NULL DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      device_label VARCHAR(120) NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_refresh_tokens_user (user_id),
      KEY idx_refresh_tokens_expires (expires_at),
      CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id CHAR(36) NOT NULL DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      consumed_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_password_reset_tokens_user (user_id),
      KEY idx_password_reset_tokens_expires (expires_at),
      CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
};

const cleanup = async () => {
  await prisma.trip.deleteMany({
    where: {
      user: {
        email: testUser.email
      }
    }
  });

  await prisma.refreshToken.deleteMany({
    where: {
      user: {
        email: testUser.email
      }
    }
  });

  await prisma.passwordResetToken.deleteMany({
    where: {
      user: {
        email: testUser.email
      }
    }
  });

  await prisma.savedDestination.deleteMany({
    where: {
      user: {
        email: testUser.email
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: testUser.email
    }
  });
};

beforeAll(async () => {
  await ensureAuthTables();
  await cleanup();

  const cities = await prisma.city.findMany({
    take: 1,
    orderBy: {
      popularityScore: "desc"
    }
  });

  cityId = cities[0]?.id || "";
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("Traveloop API integration", () => {
  it("signs up a user and returns auth tokens", async () => {
    const response = await request(app).post("/api/v1/auth/signup").send(testUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it("rejects duplicate signup", async () => {
    const response = await request(app).post("/api/v1/auth/signup").send(testUser);

    expect(response.statusCode).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("logs in and returns a fresh auth payload", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
      deviceLabel: "Vitest"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("rejects protected profile access without a token", async () => {
    const response = await request(app).get("/api/v1/users/me");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns the authenticated user profile", async () => {
    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data).not.toHaveProperty("passwordHash");
  });

  it("refreshes the session with a valid refresh token", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken,
      deviceLabel: "Vitest Refresh"
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));

    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it("returns validation errors for invalid trip payloads", async () => {
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "",
        startDate: "bad-date"
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it("lists cities with response metadata", async () => {
    const response = await request(app).get("/api/v1/cities?search=Paris&limit=5");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toHaveProperty("page");
    expect(response.body.meta).toHaveProperty("limit");
  });

  it("creates a trip for the authenticated user", async () => {
    const response = await request(app)
      .post("/api/v1/trips")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Vitest Trip",
        description: "Integration test trip",
        startDate: "2026-07-01",
        endDate: "2026-07-05",
        budgetLimit: 1200
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Vitest Trip");
    expect(response.body.data.id).toEqual(expect.any(String));

    tripId = response.body.data.id;
  });

  it("adds a trip stop and returns the city relation", async () => {
    const response = await request(app)
      .post(`/api/v1/trips/${tripId}/stops`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        cityId,
        arriveDate: "2026-07-01",
        departDate: "2026-07-03",
        orderIndex: 10,
        budgetForStop: 500
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.city).toHaveProperty("id", cityId);

    stopId = response.body.data.id;
  });

  it("returns the trip itinerary grouped into days", async () => {
    const response = await request(app)
      .get(`/api/v1/trips/${tripId}/itinerary`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.trip.id).toBe(tripId);
    expect(Array.isArray(response.body.data.days)).toBe(true);
    expect(response.body.data.days.length).toBeGreaterThan(0);
  });

  it("returns a trip list containing the created trip", async () => {
    const response = await request(app)
      .get("/api/v1/trips")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((trip) => trip.id === tripId)).toBe(true);
  });

  it("creates an expense and returns budget endpoints successfully", async () => {
    const createExpenseResponse = await request(app)
      .post(`/api/v1/trips/${tripId}/expenses`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        stopId,
        category: "activities",
        label: "Museum",
        amount: 50,
        expenseDate: "2026-07-02"
      });

    expect(createExpenseResponse.statusCode).toBe(201);
    expect(createExpenseResponse.body.success).toBe(true);

    const summaryResponse = await request(app)
      .get(`/api/v1/trips/${tripId}/budget-summary`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.body.success).toBe(true);
    expect(summaryResponse.body.data).toHaveProperty("totalSpent");
    expect(summaryResponse.body.data).toHaveProperty("categories");
  });
});
