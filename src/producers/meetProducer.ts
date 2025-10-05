import { meetQueue } from "../queues/meetQueue";

export const enqueueMeetCreation = async (appointmentId: string) => {
  await meetQueue.add("create-meet", { appointmentId });
  console.log(`📩 Enqueued meet creation job for appointment ${appointmentId}`);
};
