import { Request, Response } from "express";
import prisma from "../prismaClient";
import { enqueueMeetCreation } from "../producers/meetProducer";

// ✅ Define the create handler first
const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, therapistId, slotId } = req.body;

    const appointment = await prisma.appointment.create({
      data: { patientId, therapistId, slotId },
    });

    // 🔹 Enqueue meet creation job (if producer exists)
    await enqueueMeetCreation(appointment.id);

    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Export controller object
export const appointmentController = {
  create: createAppointment,
  list: async (req: Request, res: Response) => {
    const appointments = await prisma.appointment.findMany();
    return res.json(appointments);
  },
  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return res.status(404).json({ message: "Not found" });
    return res.json(appointment);
  },
  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.appointment.update({ where: { id }, data });
    return res.json(updated);
  },
  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    return res.json({ message: "Deleted successfully" });
  },
};
