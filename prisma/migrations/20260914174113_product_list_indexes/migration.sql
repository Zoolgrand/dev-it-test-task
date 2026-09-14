-- CreateIndex
CREATE INDEX "Product_status_name_idx" ON "Product"("status", "name");

-- CreateIndex
CREATE INDEX "Product_updatedAt_idx" ON "Product"("updatedAt");
