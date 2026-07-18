-- Notification source label (who it came from: clinic/business name, admin).
ALTER TABLE "notifications" ADD COLUMN "source" TEXT;
-- Richer vet profiles (about + contact phone).
ALTER TABLE "vet_profiles" ADD COLUMN "about" TEXT;
ALTER TABLE "vet_profiles" ADD COLUMN "phone" TEXT;
