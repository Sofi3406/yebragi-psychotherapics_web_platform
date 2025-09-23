import { Router } from "express";
import { appointmentController } from "../controllers/appointment.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validators/appointment.schema";

const router = Router();

router.post("/", validateRequest(createAppointmentSchema), appointmentController.create);
router.get("/", appointmentController.list);
router.get("/:id", appointmentController.getOne);
router.put("/:id", validateRequest(updateAppointmentSchema), appointmentController.update);
router.delete("/:id", appointmentController.delete);

export default router;
