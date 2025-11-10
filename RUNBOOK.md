# DB Migration & Backup Runbook

## Migrate
- Run new migrations:
  npx prisma migrate deploy --schema prisma/schema.prisma

## Backup
- Manual (Postgres example):
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d%H%M%S).sql

## Restore
- psql $DATABASE_URL < backup-*.sql
