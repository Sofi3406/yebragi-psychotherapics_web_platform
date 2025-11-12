import { Request, Response } from "express";
import prisma from "../prismaClient";
import { AuthRequest } from "../middleware/auth.middleware";

// List/search therapists with filters
export const listTherapists = async (req: Request, res: Response) => {
  try {
    const { search, specialization, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {
      user: {
        role: "THERAPIST",
        isVerified: true,
      },
    };

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search as string, mode: "insensitive" } } },
        { bio: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (specialization) {
      where.specializations = {
        some: {
          specialization: {
            name: { contains: specialization as string, mode: "insensitive" },
          },
        },
      };
    }

    const [therapists, total] = await Promise.all([
      prisma.therapistProfile.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          specializations: {
            include: {
              specialization: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
          availability: {
            where: {
              isBooked: false,
              startTime: { gte: new Date() },
            },
            orderBy: { startTime: "asc" },
            take: 5, // Show next 5 available slots
          },
        },
      }),
      prisma.therapistProfile.count({ where }),
    ]);

    return res.json({
      therapists,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("List therapists error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get therapist by ID with full details
export const getTherapist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
        availability: {
          where: {
            isBooked: false,
            startTime: { gte: new Date() },
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    return res.json(therapist);
  } catch (error) {
    console.error("Get therapist error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get available slots for a therapist
export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let where: any = {
      therapistId: id,
      isBooked: false,
      startTime: { gte: new Date() },
    };

    if (startDate) {
      where.startTime = { ...where.startTime, gte: new Date(startDate as string) };
    }

    if (endDate) {
      where.endTime = { lte: new Date(endDate as string) };
    }

    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: { startTime: "asc" },
    });

    return res.json({ slots });
  } catch (error) {
    console.error("Get availability error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create availability slot (therapist only)
export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "THERAPIST") {
      return res.status(403).json({ message: "Only therapists can create availability slots" });
    }

    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!therapistProfile) {
      return res.status(404).json({ message: "Therapist profile not found" });
    }

    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start time and end time are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: "Cannot create slots in the past" });
    }

    // Check for overlapping slots
    const overlapping = await prisma.availabilitySlot.findFirst({
      where: {
        therapistId: therapistProfile.id,
        isBooked: false,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return res.status(400).json({ message: "Slot overlaps with existing availability" });
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        therapistId: therapistProfile.id,
        startTime: start,
        endTime: end,
        isBooked: false,
      },
    });

    return res.status(201).json(slot);
  } catch (error) {
    console.error("Create availability error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete availability slot (therapist only)
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "THERAPIST") {
      return res.status(403).json({ message: "Only therapists can delete availability slots" });
    }

    const { slotId } = req.params;

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        therapist: {
          select: { userId: true },
        },
      },
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.therapist.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own slots" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Cannot delete a booked slot" });
    }

    await prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return res.json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("Delete availability error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const therapistController = {
  list: listTherapists,
  getOne: getTherapist,
  getAvailability,
  createAvailability,
  deleteAvailability,
};




