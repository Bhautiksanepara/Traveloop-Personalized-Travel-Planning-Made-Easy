import request from "supertest";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/models/prisma/client.js";

const publicToken = "TL-EuropeBali2026-xK9mZ2";
const sourceTripId = "t0000001-0000-0000-0000-000000000001";
const testUser = {
  name: "Extended Flow User",
  email: `extended-${Date.now()}@traveloop.local`,
  password: "password123",
  language: "en"
};

let userAccessToken = "";
let adminAccessToken = "";
let copiedTripId = "";
let createdPackingItemId = "";
let createdNoteId = "";

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

  const scheduledDateColumn = await prisma.$queryRawUnsafe(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'stop_activities'
      AND COLUMN_NAME = 'scheduled_date'
  `);

  if (!scheduledDateColumn.length) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE stop_activities
        ADD COLUMN scheduled_date DATE NULL AFTER activity_id
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX idx_stop_act_date
      ON stop_activities (stop_id, scheduled_date)
    `);
  }
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

  await prisma.user.deleteMany({
    where: {
      email: testUser.email
    }
  });
};

beforeAll(async () => {
  await ensureAuthTables();
  await cleanup();

  const signup = await request(app).post("/api/v1/auth/signup").send(testUser);
  userAccessToken = signup.body.data.accessToken;

  const adminLogin = await request(app).post("/api/v1/auth/login").send({
    email: "admin@traveloop.com",
    password: "password123",
    deviceLabel: "Extended Admin"
  });
  adminAccessToken = adminLogin.body.data.accessToken;
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("Extended Traveloop flows", () => {
  it("lists active shared trips for the community feed", async () => {
    const response = await request(app).get("/api/v1/public/trips");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((item) => item.publicToken === publicToken)).toBe(true);

    const sharedTrip = response.body.data.find((item) => item.publicToken === publicToken);
    expect(sharedTrip.trip.name).toBe("Europe & Bali Dream Trip");
    expect(sharedTrip.trip.stopsCount).toBeGreaterThan(0);
    expect(sharedTrip.trip.cities.length).toBeGreaterThan(0);
  });

  it("copies the shared public trip into the authenticated user account", async () => {
    const response = await request(app)
      .post(`/api/v1/public/trips/${publicToken}/copy`)
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toContain("(Copy)");

    copiedTripId = response.body.data.id;

    const copiedTrip = await prisma.trip.findUnique({
      where: { id: copiedTripId },
      include: {
        stops: { include: { activities: true } },
        packingItems: true,
        notes: true,
        expenses: true
      }
    });

    expect(copiedTrip.stops).toHaveLength(2);
    expect(copiedTrip.stops.reduce((sum, stop) => sum + stop.activities.length, 0)).toBe(5);
    expect(copiedTrip.packingItems).toHaveLength(6);
    expect(copiedTrip.notes).toHaveLength(1);
    expect(copiedTrip.expenses).toHaveLength(0);
  });

  it("creates, updates, and resets packing items for the copied trip", async () => {
    const createResponse = await request(app)
      .post(`/api/v1/trips/${copiedTripId}/packing-items`)
      .set("Authorization", `Bearer ${userAccessToken}`)
      .send({
        name: "Travel Pillow",
        category: "other",
        orderIndex: 999
      });

    expect(createResponse.statusCode).toBe(201);
    createdPackingItemId = createResponse.body.data.id;

    const updateResponse = await request(app)
      .patch(`/api/v1/trips/${copiedTripId}/packing-items/${createdPackingItemId}`)
      .set("Authorization", `Bearer ${userAccessToken}`)
      .send({
        isPacked: true
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.data.isPacked).toBe(true);

    const resetResponse = await request(app)
      .post(`/api/v1/trips/${copiedTripId}/packing-items/reset`)
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(resetResponse.statusCode).toBe(200);

    const listResponse = await request(app)
      .get(`/api/v1/trips/${copiedTripId}/packing-items`)
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.data.every((item) => item.isPacked === false)).toBe(true);
  });

  it("creates and deletes notes for the copied trip", async () => {
    const createResponse = await request(app)
      .post(`/api/v1/trips/${copiedTripId}/notes`)
      .set("Authorization", `Bearer ${userAccessToken}`)
      .send({
        content: "Remember to check local transport passes.",
        noteDate: "2026-06-02"
      });

    expect(createResponse.statusCode).toBe(201);
    createdNoteId = createResponse.body.data.id;

    const listResponse = await request(app)
      .get(`/api/v1/trips/${copiedTripId}/notes`)
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.body.data.some((note) => note.id === createdNoteId)).toBe(true);

    const deleteResponse = await request(app)
      .delete(`/api/v1/trips/${copiedTripId}/notes/${createdNoteId}`)
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(deleteResponse.statusCode).toBe(200);
  });

  it("blocks non-admin users from admin endpoints", async () => {
    const response = await request(app)
      .get("/api/v1/admin/overview")
      .set("Authorization", `Bearer ${userAccessToken}`);

    expect(response.statusCode).toBe(403);
  });

  it("returns admin overview, user list, trip list, and analytics for admin users", async () => {
    const [overview, users, trips, cities, activities, engagement] = await Promise.all([
      request(app).get("/api/v1/admin/overview").set("Authorization", `Bearer ${adminAccessToken}`),
      request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${adminAccessToken}`),
      request(app).get("/api/v1/admin/trips").set("Authorization", `Bearer ${adminAccessToken}`),
      request(app).get("/api/v1/admin/analytics/cities").set("Authorization", `Bearer ${adminAccessToken}`),
      request(app).get("/api/v1/admin/analytics/activities").set("Authorization", `Bearer ${adminAccessToken}`),
      request(app).get("/api/v1/admin/analytics/engagement").set("Authorization", `Bearer ${adminAccessToken}`)
    ]);

    expect(overview.statusCode).toBe(200);
    expect(overview.body.data.users).toBeGreaterThanOrEqual(3);

    expect(users.statusCode).toBe(200);
    expect(Array.isArray(users.body.data)).toBe(true);
    expect(users.body.data.some((user) => user.email === "demo@traveloop.com")).toBe(true);

    expect(trips.statusCode).toBe(200);
    expect(trips.body.data.some((trip) => trip.id === sourceTripId)).toBe(true);

    expect(cities.statusCode).toBe(200);
    expect(cities.body.data.length).toBeGreaterThan(0);

    expect(activities.statusCode).toBe(200);
    expect(activities.body.data.length).toBeGreaterThan(0);

    expect(engagement.statusCode).toBe(200);
    expect(engagement.body.data.some((user) => user.email === "demo@traveloop.com")).toBe(true);
  });
});
