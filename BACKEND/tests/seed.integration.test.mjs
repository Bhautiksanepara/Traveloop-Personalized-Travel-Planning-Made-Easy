import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/models/prisma/client.js";

const seededTripId = "t0000001-0000-0000-0000-000000000001";
const seededToken = "TL-EuropeBali2026-xK9mZ2";

let accessToken = "";

beforeAll(async () => {
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

  const response = await request(app).post("/api/v1/auth/login").send({
    email: "demo@traveloop.com",
    password: "password123",
    deviceLabel: "Seed Verification"
  });

  expect(response.statusCode).toBe(200);
  accessToken = response.body.data.accessToken;
});

describe("Seeded Traveloop flow", () => {
  it("logs in with the documented demo credentials", async () => {
    expect(accessToken).toEqual(expect.any(String));
  });

  it("returns the seeded public itinerary", async () => {
    const response = await request(app).get(`/api/v1/public/trips/${seededToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.trip.name).toBe("Europe & Bali Dream Trip");
    expect(response.body.data.trip.user.email).toBe("demo@traveloop.com");
    expect(response.body.data.trip.stops).toHaveLength(2);
  });

  it("returns the seeded trip details with Paris and Bali stops", async () => {
    const response = await request(app)
      .get(`/api/v1/trips/${seededTripId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.name).toBe("Europe & Bali Dream Trip");
    expect(response.body.data.slug).toBe("europe-bali-dream-2026");
    expect(response.body.data.stops.map((stop) => stop.city.name)).toEqual(["Paris", "Bali"]);
    expect(response.body.data.stops[0].activities).toHaveLength(3);
    expect(response.body.data.stops[1].activities).toHaveLength(2);
    expect(response.body.data.expenses).toHaveLength(5);
    expect(response.body.data.packingItems).toHaveLength(6);
    expect(response.body.data.notes).toHaveLength(1);
    expect(response.body.data.sharedTrip.publicToken).toBe(seededToken);
  });

  it("returns the seeded Bali activities", async () => {
    const response = await request(app).get(
      "/api/v1/cities/c0000001-0000-0000-0000-000000000016/activities?limit=10"
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.data.map((activity) => activity.name)).toEqual([
      "Ubud Monkey Forest",
      "Tanah Lot Temple",
      "Kuta Beach Surfing",
      "Balinese Cooking Class",
      "White Water Rafting"
    ]);
  });

  it("returns the seeded budget summary totals", async () => {
    const response = await request(app)
      .get(`/api/v1/trips/${seededTripId}/budget-summary`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual({
      budgetLimit: 3500,
      totalSpent: 2245,
      remaining: 1255,
      averageCostPerDay: 149.67,
      categories: {
        transport: 850,
        accommodation: 1280,
        activities: 115,
        meals: 0,
        other: 0
      }
    });
  });

  it("returns itinerary days with visible scheduled activities", async () => {
    const response = await request(app)
      .get(`/api/v1/trips/${seededTripId}/itinerary`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.days.length).toBeGreaterThan(0);
    expect(response.body.data.days[0].dayNumber).toBe(1);
    expect(response.body.data.days.some((day) => day.activities.length > 0)).toBe(true);
  });

  it("supports backend itinerary search, grouping, filtering, and sorting", async () => {
    const response = await request(app)
      .get(
        `/api/v1/trips/${seededTripId}/itinerary?search=paris&groupBy=city&hasActivities=true&sortOrder=desc`
      )
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.query.groupBy).toBe("city");
    expect(response.body.data.query.sortOrder).toBe("desc");
    expect(response.body.data.days.every((day) => day.city.name === "Paris")).toBe(true);
    expect(response.body.data.days.every((day) => day.activities.length > 0)).toBe(true);
    expect(response.body.data.groups[0].type).toBe("city");
  });

  it("returns the seeded note for the Paris stop", async () => {
    const response = await request(app)
      .get(`/api/v1/trips/${seededTripId}/notes`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].content).toContain("Hotel check-in after 2pm");
  });
});
