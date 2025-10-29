import request from "supertest";
import app from "../../../src/index";
import prisma from "../../../src/prismaClient";

jest.setTimeout(30000); // For long-running DB operations

describe("User Lifecycle E2E", () => {
  const testEmail = "e2euser@example.com";
  const testPassword = "MySecret123!";
  let verificationOtp: string;
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.jobRecord.deleteMany({}); // Remove all OTP records for clean test
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.jobRecord.deleteMany({});
    await prisma.$disconnect();
  });

  it("registers a user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        body: {
          fullName: "Test E2E User",
          email: testEmail,
          password: testPassword,
        }
      });

    if (res.status !== 201) console.error("Register error:", res.body);

    expect(res.status).toBe(201);
    userId = res.body?.user?.id;
    expect(userId).toBeTruthy();
  });

  it("fetches OTP for email verification (mock)", async () => {
    // Fetch recent jobs manually and match email in JS
    const debugJobs = await prisma.$queryRaw<
      Array<{ id: string, payload: any, createdAt: Date, type: string }>
    >`SELECT * FROM "JobRecord"
      WHERE type = 'OTP'
      ORDER BY "createdAt" DESC
      LIMIT 5`;
    const job = debugJobs.find(j =>
      typeof j.payload?.email === 'string' &&
      j.payload.email.toLowerCase().trim() === testEmail.toLowerCase().trim()
    );
    expect(job).toBeTruthy();
    verificationOtp = job?.payload?.otp || "";
    expect(verificationOtp.length).toBe(6);
  });

  it("verifies the user's email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({
        body: {
          email: testEmail,
          otp: verificationOtp,
        }
      });

    if (res.status !== 200) console.error("Verify email error:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified/i);
  });

  it("logs in verified user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        body: {
          email: testEmail,
          password: testPassword,
        }
      });

    if (res.status !== 200) console.error("Login error:", res.body);

    expect(res.status).toBe(200);
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  });

  it("refreshes user token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh-token")
      .send({
        body: {
          refreshToken,
        }
      });

    if (res.status !== 200) console.error("Refresh token error:", res.body);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });
});
