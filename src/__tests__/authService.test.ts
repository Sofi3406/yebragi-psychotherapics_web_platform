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

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn((plain, hashed) =>
    Promise.resolve(plain === "validpassword" && hashed === "hashedpassword")
  ),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked-jwt"),
  verify: jest.fn().mockReturnValue({ id: "user-id" }),
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user", async () => {
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user-id",
      email: "test@example.com",
      password: "hashedpassword",
      fullName: "Test User",
    });

    const user = await authService.register(
      "test@example.com",
      "password123",
      "Test User"
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        password: "hashedpassword",
        fullName: "Test User",
      },
    });
    expect(user.email).toBe("test@example.com");
  });

  it("should login a user and return tokens", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-id",
      email: "test@example.com",
      password: "hashedpassword",
      fullName: "Test User",
      role: "USER",
    });

    const tokens = await authService.login("test@example.com", "validpassword");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(tokens.accessToken).toBe("mocked-jwt");
    expect(tokens.refreshToken).toBe("mocked-jwt");
    expect(tokens.user.email).toBe("test@example.com");
  });

  it("should throw error for invalid login credentials", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.login("wrong@example.com", "invalidpassword")
    ).rejects.toThrow("Invalid credentials");
  });

  it("should refresh token", async () => {
    const newToken = await authService.refresh("mocked-jwt");

    expect(jwt.verify).toHaveBeenCalledWith("mocked-jwt", "secret");
    expect(jwt.sign).toHaveBeenCalled();
    expect(newToken.accessToken).toBe("mocked-jwt");
  });

  it("should throw error for invalid refresh token", async () => {
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid refresh token");
    });

    await expect(authService.refresh("bad-token")).rejects.toThrow(
      "Invalid refresh token"
    );
  });
});
