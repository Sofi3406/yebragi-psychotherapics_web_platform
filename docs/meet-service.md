# Meet Client Service

## Modes
1. MOCK mode (default)  
   - Returns links like `https://meet.fake-service.com/{appointmentId}`  
   - Used in dev and test environments.

2. GOOGLE mode  
   - Creates actual Google Meet events via the Calendar API using a service account.

## Required Google Setup
- Enable Google Calendar API in Cloud Console.
- Create a service account and download credentials as JSON.
- Share the target calendar with the service account email.
- Set `GOOGLE_SERVICE_ACCOUNT_PATH` and `GOOGLE_CALENDAR_ID` in `.env`.
