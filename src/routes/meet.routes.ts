import { Router } from "express";
import { meetController } from "../controllers/meet.controller";
import { validateRequest } from "../middleware/validateRequest";
import { createMeetJobSchema } from "../validators/meet.schema";

const router = Router();

// Enqueue new meet job (validated)
router.post("/", validateRequest(createMeetJobSchema), meetController.enqueue);

// Get status for single job by jobId
router.get("/:jobId", meetController.getJobStatus);

// Get meet link by appointmentId
router.get("/appointment/:appointmentId", meetController.getMeetLink);

// Get list of recent jobs for dashboard UI
router.get("/jobs", meetController.getJobs);

export default router;
