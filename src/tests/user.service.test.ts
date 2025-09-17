import { userService } from "../services/user.service";
import prisma from "../prismaClient";
import { Role } from "@prisma/client";

describe("UserService", () => {
  beforeEach(async () => {
    // Clean database in the right order
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.therapistSpecialization.deleteMany();
    await prisma.therapistProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user", async () => {
    const user = await userService.register(
      "test@example.com",
      "password123",
      "Test User",
      Role.PATIENT
    );

    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe(Role.PATIENT);
  });

  it("should login with correct credentials", async () => {
    await userService.register(
      "login@example.com",
      "mypassword",
      "Login User",
      Role.THERAPIST
    );

    const result = await userService.login("login@example.com", "mypassword");

    expect(result).toHaveProperty("accessToken");
    expect(result.user.email).toBe("login@example.com");
  });

  it("should not login with wrong password", async () => {
    await userService.register(
      "wrongpass@example.com",
      "correctpass",
      "Wrong Pass",
      Role.ADMIN
    );

    await expect(
      userService.login("wrongpass@example.com", "incorrectpass")
    ).rejects.toThrow("Invalid credentials");
  });

  it("should refresh a valid token", async () => {
    await userService.register(
      "refresh@example.com",
      "refreshpass",
      "Refresh User",
      Role.PATIENT
    );

    const login = await userService.login("refresh@example.com", "refreshpass");
    const refreshed = await userService.refreshToken(login.refreshToken);

    expect(refreshed).toHaveProperty("accessToken");
  });

  it("should throw on invalid refresh token", async () => {
    await expect(userService.refreshToken("invalid.token")).rejects.toThrow(
      "Invalid refresh token"
    );
  });
});
