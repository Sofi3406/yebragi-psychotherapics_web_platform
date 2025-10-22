// src/services/meet.client.ts
import { google } from "googleapis";

export interface MeetClientConfig {
  mode: "MOCK" | "GOOGLE";
  googleCredentialsPath?: string;
  calendarId?: string;
}

export class MeetClient {
  private mode: "MOCK" | "GOOGLE";
  private calendar?: any;

  constructor(config: MeetClientConfig) {
    this.mode = config.mode;

    if (this.mode === "GOOGLE" && config.googleCredentialsPath && config.calendarId) {
      const auth = new google.auth.GoogleAuth({
        keyFile: config.googleCredentialsPath,
        scopes: ["https://www.googleapis.com/auth/calendar.events"],
      });
      this.calendar = google.calendar({ version: "v3", auth });
    }
  }

  async createMeetLink(appointmentId: string, title: string, startTime?: string) {
    // Always mock if mode = MOCK
    if (this.mode === "MOCK") {
      const url = `https://meet.fake-service.com/${appointmentId}`;
      console.log("⚙️  Using MOCK meet link:", url);
      return url;
    }

    // Defensive fallback if Google config missing
    if (!this.calendar || !process.env.GOOGLE_CALENDAR_ID) {
      console.warn("⚠️  Google Calendar not configured — defaulting to mock link");
      return `https://meet.mock/${appointmentId}`;
    }

    // Real Google Calendar event creation
    const eventResponse = await this.calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: {
        summary: title || "Psychotherapy Session",
        start: { dateTime: startTime || new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
        conferenceData: {
          createRequest: {
            requestId: appointmentId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    const meetLink = eventResponse.data?.hangoutLink || "";
    console.log("✅  Google Meet link created:", meetLink);
    return meetLink;
  }
}

// Export a singleton client
export const meetClient = new MeetClient({
  mode: process.env.MOCK_MEET === "true" ? "MOCK" : "GOOGLE",
  googleCredentialsPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  calendarId: process.env.GOOGLE_CALENDAR_ID,
});
