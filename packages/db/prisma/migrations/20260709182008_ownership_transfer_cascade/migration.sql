-- DropForeignKey
ALTER TABLE "ownership_transfers" DROP CONSTRAINT "ownership_transfers_newOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "ownership_transfers" DROP CONSTRAINT "ownership_transfers_oldOwnerId_fkey";

-- AddForeignKey
ALTER TABLE "ownership_transfers" ADD CONSTRAINT "ownership_transfers_oldOwnerId_fkey" FOREIGN KEY ("oldOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership_transfers" ADD CONSTRAINT "ownership_transfers_newOwnerId_fkey" FOREIGN KEY ("newOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
