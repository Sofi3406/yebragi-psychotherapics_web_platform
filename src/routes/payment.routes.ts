import { Router } from "express";

const router = Router();

// Temporary stub route
router.get("/", (req, res) => {
  res.json({ message: "Payments route works" });
});

export default router;
