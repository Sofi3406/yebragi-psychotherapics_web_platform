import { Request, Response } from "express";
import prisma from "../prismaClient"; // Adjust based on your Prisma setup
import { AuthRequest } from "../middleware/auth.middleware";

const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // User ID from JWT token
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        therapistProfile: {
          select: {
            id: true,
            bio: true,
            licenseNumber: true,
            specializations: {
              include: {
                specialization: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { fullName } = req.body;

    // Validate input
    if (!fullName) {
      return res.status(400).json({ message: "Full name is required." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName },
      select: {
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userController = {
  getProfile,
  updateProfile,
};