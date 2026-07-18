-- Business-context flags: pets/listings created from the business dashboard.
ALTER TABLE "pets" ADD COLUMN "asBusiness" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "listings" ADD COLUMN "asBusiness" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: existing BUSINESS-account content counts as business content.
UPDATE "listings" SET "asBusiness" = true
WHERE "userId" IN (SELECT "id" FROM "users" WHERE "accountType" = 'BUSINESS');
UPDATE "pets" SET "asBusiness" = true
WHERE "ownerId" IN (SELECT "id" FROM "users" WHERE "accountType" = 'BUSINESS');
