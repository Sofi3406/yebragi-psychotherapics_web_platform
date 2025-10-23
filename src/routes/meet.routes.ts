import { Router } from "express";
import { meetController } from "../controllers/meet.controller";
import { validateRequest } from "../middleware/validateRequest";
import { createMeetJobSchema } from "../validators/meet.schema";

const router = Router();

router.post("/", validateRequest(createMeetJobSchema), meetController.enqueue);
router.get("/:jobId", meetController.getJobStatus);
router.get("/appointment/:appointmentId", meetController.getMeetLink);

export default router;
