import { Request, Response } from "express";
import prisma from "../prismaClient";
import { enqueueMeetCreation } from "../producers/meetProducer";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, therapistId, slotId } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        slotId,
      },
    });

    // 🔹 Enqueue meet creation job
    await enqueueMeetCreation(appointment.id);

    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
