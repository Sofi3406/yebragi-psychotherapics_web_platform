# Day 1 – Project Bootstrap & Schema Design

## ✅ Task 1 – Users Schema
- Models: User, Role, TherapistProfile, Specialization, TherapistSpecialization
- Relation: One-to-one User ↔ TherapistProfile, Many-to-many TherapistProfile ↔ Specialization
- Migration: `npx prisma migrate dev --name init_users_schema`

## ✅ Task 2 – Appointments Schema
- Models: Appointment, AppointmentStatus, AvailabilitySlot
- Constraints: Slot can’t overlap; isBooked flag used
- Index suggestion: `(therapistId, startTime, endTime)` for fast availability search

## ✅ Task 4 – Payments Schema
- Models: Payment, PaymentStatus
- Includes txRef, rawResponse (JSON for payment gateway response)

## ✅ Task 5 – Meet + Article Schema
- Appointment has meetLink
- Added Article + ScrapeJob

## ✅ Task 6 – Chatbot Schema
- Models: Conversation, Message, JobRecord
- Conversation has state + ttl for expiring sessions
