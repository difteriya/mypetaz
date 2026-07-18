-- Vet approval/rejection notification types (PLAN.md §7.1)
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VET_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'VET_REJECTED';
