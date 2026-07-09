-- AlterTable
ALTER TABLE "pet_health_records" ADD COLUMN     "addedById" TEXT;

-- AddForeignKey
ALTER TABLE "pet_health_records" ADD CONSTRAINT "pet_health_records_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
