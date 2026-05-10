import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app.js";

describe("Traveloop API", () => {
  it("responds on health check", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("returns 404 for unknown versioned routes", async () => {
    const response = await request(app).get("/api/v1/does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
