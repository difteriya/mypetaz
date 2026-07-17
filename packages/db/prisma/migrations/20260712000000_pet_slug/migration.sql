-- Add readable URL slug to pets (nullable + unique; multiple NULLs allowed in Postgres).
ALTER TABLE "pets" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "pets_slug_key" ON "pets"("slug");
