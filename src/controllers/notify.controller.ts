import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

// POST /api/notify
export const notify = async (req: Request, res: Response) => {
  const { userId, appointmentId, type, message, data } = req.body || {};
  if (!type || !message) {
    return res.status(400).json({ message: "Missing notification type or message" });
  }
  try {
    const notification = await notificationService.createNotification({ userId, appointmentId, type, message, data });
    res.json({ ok: true, notification });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/notify/:userId
export const getUserNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const notifications = await notificationService.getNotifications({ userId });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/notify/mark-read/:id
export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await notificationService.markNotificationRead(id);
    res.json({ ok: true, notification: updated });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
