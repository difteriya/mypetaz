-- Old→new slug redirects for renamed taxonomy (301/308).
CREATE TABLE "slug_redirects" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "fromSlug" TEXT NOT NULL,
    "toSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "slug_redirects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "slug_redirects_scope_fromSlug_key" ON "slug_redirects"("scope", "fromSlug");
