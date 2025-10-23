import prisma from "../prismaClient";

type NotificationCreateInput = {
  userId?: string;
  appointmentId?: string;
  type: string;
  message: string;
  data?: Record<string, any>;
};

export const notificationService = {
  // Create a new notification, return the saved record
  async createNotification(input: NotificationCreateInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId || null,
        appointmentId: input.appointmentId || null,
        type: input.type,
        message: input.message,
        data: input.data ?? {},
      },
    });
  },

  // Get most recent notifications for a specific user
  async getNotifications(options: { userId: string }) {
    return prisma.notification.findMany({
      where: { userId: options.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  },

  // Mark a notification as read
  async markNotificationRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }
};
