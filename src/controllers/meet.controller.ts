import { Request, Response } from "express";
import { meetService } from "../services/meet.service";

export const meetController = {
  async enqueue(req: Request, res: Response) {
    try {
      const { appointmentId, title } = req.body;
      const job = await meetService.enqueueMeetJob(appointmentId, title);
      return res.status(201).json({
        message: "Meet generation job enqueued successfully",
        jobId: job.id,
      });
    } catch (err: any) {
      console.error("Meet enqueue error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  async getJobStatus(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const status = await meetService.getJobStatus(jobId);
      if (!status) return res.status(404).json({ message: "Job not found" });
      return res.json(status);
    } catch (err: any) {
      console.error("Meet job status error:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  async getMeetLink(req: Request, res: Response) {
    try {
      const { appointmentId } = req.params;
      const link = await meetService.getMeetLink(appointmentId);
      if (!link) return res.status(404).json({ message: "Meet link not found" });
      return res.json({ appointmentId, meetLink: link });
    } catch (err: any) {
      console.error("Meet link fetch error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
