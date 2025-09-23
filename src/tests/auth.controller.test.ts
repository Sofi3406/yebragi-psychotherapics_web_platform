import request from "supertest";
import app from "../index";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appointmentController } from "../controllers/appointment.controller";
import { articlesController } from "../controllers/articles.controller";
import { chatController } from "../controllers/chat.controller";
import { paymentController } from "../controllers/payment.controller";

// ✅ Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "hashedpassword"),
  compare: jest.fn(),
}));

// ✅ Mock jwt
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fakeToken"),
}));

// ✅ Mock Prisma client
jest.mock("../prismaClient", () => {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
});

describe("Auth Controller", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    fullName: "Test User", // ✅ added fullName
    password: "hashedpassword",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should create a user successfully", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "test@example.com",
          password: "Password123!",
          fullName: "Test User", // ✅ required field
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id", "user-123");
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should return 400 if validation fails", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({}); // missing email/password/fullName

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 200 and tokens if credentials are valid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "Password123!",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should return 401 if credentials are invalid", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // ❌ wrong password

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "wrong@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
    });
  });
});

