import { Request, Response } from "express";
import { appointmentService } from "../services/appointment.service";


export class AppointmentController {
  async create(req: Request, res: Response) {
    const appointment = await appointmentService.createAppointment(req.body);
    return res.status(201).json(appointment);
  }

  async list(req: Request, res: Response) {
    const appointments = await appointmentService.getAppointments();
    return res.json(appointments);
  }

  async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    return res.json(appointment);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const appointment = await appointmentService.updateAppointment(id, req.body);
    return res.json(appointment);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await appointmentService.deleteAppointment(id);
    return res.status(204).send();
  }
}

export const appointmentController = new AppointmentController();
