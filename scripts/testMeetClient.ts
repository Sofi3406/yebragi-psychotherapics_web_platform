// scripts/testMeetClient.ts
import { google } from "googleapis";

require("dotenv").config();
const { meetClient } = require("../src/services/meet.client");

(async () => {
  try {
    const meetLink = await meetClient.createMeetLink("appt123", "Therapy Session Test");
    console.log("✅ Meet Link:", meetLink);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
