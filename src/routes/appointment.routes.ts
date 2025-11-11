import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validators/appointment.schema";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", validateRequest(createAppointmentSchema), appointmentController.create);
router.get("/", appointmentController.list);
router.get("/:id", appointmentController.getOne);
router.put("/:id", validateRequest(updateAppointmentSchema), appointmentController.update);
router.delete("/:id", appointmentController.delete);
router.post("/:id/accept", appointmentController.accept);
router.post("/:id/decline", appointmentController.decline);
router.post("/:id/complete", appointmentController.complete);

export default router;
