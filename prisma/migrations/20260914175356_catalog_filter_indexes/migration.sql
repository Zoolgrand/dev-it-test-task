-- DropIndex
DROP INDEX "Product_status_idx";

-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_status_updatedAt_idx" ON "Product"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ProductAttribute_name_productId_idx" ON "ProductAttribute"("name", "productId");
