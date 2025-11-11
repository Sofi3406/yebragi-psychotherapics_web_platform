import { Response } from "express";
import prisma from "../prismaClient";
import { enqueueMeetCreation } from "../producers/meetProducer";
import { AuthRequest } from "../middleware/auth.middleware";

const appointmentInclude = {
  slot: {
    include: {
      therapist: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
    },
  },
  therapist: {
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
      specializations: {
        select: {
          specialization: {
            select: { name: true },
          },
        },
      },
    },
  },
  patient: {
    select: { id: true, fullName: true, email: true },
  },
  payment: true,
};

const buildStats = (appointments: any[]) => {
  const now = new Date();
  return {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    upcoming: appointments.filter(
      (a) => a.slot?.startTime && new Date(a.slot.startTime) > now
    ).length,
  };
};

const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { therapistId, slotId } = req.body;
    const patientId =
      req.user.role === "PATIENT" ? req.user.id : req.body.patientId;

    if (req.user.role !== "PATIENT" && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only patients can book appointments" });
    }

    if (!therapistId || !slotId) {
      return res
        .status(400)
        .json({ message: "Therapist and slot are required" });
    }

    if (!patientId) {
      return res
        .status(400)
        .json({ message: "Patient is required to create an appointment" });
    }

    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.isBooked || slot.therapistId !== therapistId) {
      return res
        .status(400)
        .json({ message: "Invalid or unavailable slot selected" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        slotId,
      },
    });

    await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    await enqueueMeetCreation(appointment.id);

    const created = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: appointmentInclude,
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const appointmentController = {
  create: createAppointment,
  list: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let where: any = {};

      if (req.user.role === "PATIENT") {
        where.patientId = req.user.id;
      } else if (req.user.role === "THERAPIST") {
        const therapistProfile = await prisma.therapistProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });

        if (!therapistProfile) {
          return res.json({ appointments: [], stats: buildStats([]) });
        }

        where.therapistId = therapistProfile.id;
      }

      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { slot: { startTime: "asc" } },
        include: appointmentInclude,
      });

      return res.json({ appointments, stats: buildStats(appointments) });
    } catch (error) {
      console.error("List appointments error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  getOne: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: appointmentInclude,
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (req.user.role === "PATIENT" && appointment.patientId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (req.user.role === "THERAPIST") {
        const therapistProfile = await prisma.therapistProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });

        if (!therapistProfile || appointment.therapistId !== therapistProfile.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      return res.json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  update: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const data = req.body;

      const existing = await prisma.appointment.findUnique({
        where: { id },
        include: {
          therapist: { select: { id: true, userId: true } },
          patient: { select: { id: true } },
        },
      });

      if (!existing) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (req.user.role === "PATIENT" && existing.patientId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (req.user.role === "THERAPIST") {
        const therapistProfile = await prisma.therapistProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });

        if (!therapistProfile || existing.therapistId !== therapistProfile.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data,
        include: appointmentInclude,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Update appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      const existing = await prisma.appointment.findUnique({
        where: { id },
        include: { 
          therapist: { select: { id: true, userId: true } },
          slot: true,
        },
      });

      if (!existing) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (req.user.role === "PATIENT" && existing.patientId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (req.user.role === "THERAPIST") {
        const therapistProfile = await prisma.therapistProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });

        if (!therapistProfile || existing.therapistId !== therapistProfile.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      // Free up the slot
      await prisma.availabilitySlot.update({
        where: { id: existing.slotId },
        data: { isBooked: false },
      });

      await prisma.appointment.delete({ where: { id } });

      return res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  // Accept appointment (therapist only)
  accept: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== "THERAPIST") {
        return res.status(403).json({ message: "Only therapists can accept appointments" });
      }

      const { id } = req.params;

      const therapistProfile = await prisma.therapistProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!therapistProfile) {
        return res.status(404).json({ message: "Therapist profile not found" });
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: appointmentInclude,
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.therapistId !== therapistProfile.id) {
        return res.status(403).json({ message: "You can only accept your own appointments" });
      }

      if (appointment.status !== "PENDING") {
        return res.status(400).json({ message: "Only pending appointments can be accepted" });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "CONFIRMED" },
        include: appointmentInclude,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Accept appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  // Decline appointment (therapist only)
  decline: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== "THERAPIST") {
        return res.status(403).json({ message: "Only therapists can decline appointments" });
      }

      const { id } = req.params;

      const therapistProfile = await prisma.therapistProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!therapistProfile) {
        return res.status(404).json({ message: "Therapist profile not found" });
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { slot: true },
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.therapistId !== therapistProfile.id) {
        return res.status(403).json({ message: "You can only decline your own appointments" });
      }

      if (appointment.status !== "PENDING") {
        return res.status(400).json({ message: "Only pending appointments can be declined" });
      }

      // Free up the slot
      await prisma.availabilitySlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: appointmentInclude,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Decline appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  // Complete appointment (therapist only)
  complete: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || req.user.role !== "THERAPIST") {
        return res.status(403).json({ message: "Only therapists can complete appointments" });
      }

      const { id } = req.params;

      const therapistProfile = await prisma.therapistProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!therapistProfile) {
        return res.status(404).json({ message: "Therapist profile not found" });
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: appointmentInclude,
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.therapistId !== therapistProfile.id) {
        return res.status(403).json({ message: "You can only complete your own appointments" });
      }

      if (appointment.status !== "CONFIRMED") {
        return res.status(400).json({ message: "Only confirmed appointments can be completed" });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: "COMPLETED" },
        include: appointmentInclude,
      });

      return res.json(updated);
    } catch (error) {
      console.error("Complete appointment error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};
