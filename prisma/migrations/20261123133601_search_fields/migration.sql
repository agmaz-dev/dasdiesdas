-- Trigramm-Erweiterung (trusted extension, ab PostgreSQL 13 ohne Superuser)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "attrIndex" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Listing_searchText_idx" ON "Listing" USING GIN ("searchText" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Listing_attributes_idx" ON "Listing" USING GIN ("attributes" jsonb_path_ops);
