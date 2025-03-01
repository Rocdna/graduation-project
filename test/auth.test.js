import request from "supertest";
import app from "../serve/server.js";
import User from "../serve/models/user.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

describe("Auth API Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("Registration", () => {
    it("should register a new user with valid credentials", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "ValidPass123!",
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject weak passwords", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "weak",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("密码至少需要8个字符");
    });

    it("should reject duplicate username", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "ValidPass123!",
      });

      // Second registration with same username
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "ValidPass123!",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("用户名已存在");
    });
  });

  describe("Login", () => {
    const testUser = {
      username: "testuser",
      password: "ValidPass123!@#",
    };

    beforeEach(async () => {
      // Register test user
      const res = await request(app).post("/api/auth/register").send(testUser);
      if (res.statusCode !== 201) {
        console.error('Registration failed:', res.body);
      }
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send(testUser);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("username");
      expect(res.body.username).toEqual(testUser.username);
    });

    it("should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: testUser.username, password: "wrongpassword" });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual("用户名或密码错误");
    });

    it("should reject non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nonexistent", password: "anypassword" });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual("用户名或密码错误");
    });
  });
});
