import { authService } from "../services/auth.service";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../prismaClient", () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user", async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      fullName: "Test User",
    });

    const user = await authService.register("test@example.com", "password123", "Test User");

    expect(user).toHaveProperty("id", "user-1");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@example.com",
          fullName: "Test User",
        }),
      })
    );
  });

  it("should login a user with valid credentials", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: hashedPassword,
      fullName: "Test User",
    });

    const result = await authService.login("test@example.com", "password123");

    expect(result).toHaveProperty("token");
    expect(result.user).toHaveProperty("email", "test@example.com");
  });

  it("should throw error for invalid credentials", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login("wrong@example.com", "password123")
    ).rejects.toThrow("Invalid credentials");
  });
});
