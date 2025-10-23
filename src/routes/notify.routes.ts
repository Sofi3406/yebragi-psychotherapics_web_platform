import { Router } from "express";
import { notify, getUserNotifications, markRead } from "../controllers/notify.controller";

const router = Router();

// Place test/debug routes first, before dynamic routes
router.get("/testa", (req, res) => { 
  console.log("GET /api/notify/testa hit!");
  res.json({ ok: true }); 
});
router.get("/testb", (req, res) => { 
  res.json({ ok: "b" }); 
});

router.post("/", notify);
router.post("/mark-read/:id", markRead);

router.get("/:userId", getUserNotifications);

export default router;
