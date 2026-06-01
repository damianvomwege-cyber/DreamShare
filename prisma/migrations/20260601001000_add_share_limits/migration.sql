-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dreamId" TEXT NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_dreamId_userId_key" ON "Share"("dreamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Share_dreamId_anonymousId_key" ON "Share"("dreamId", "anonymousId");

-- CreateIndex
CREATE INDEX "Share_dreamId_createdAt_idx" ON "Share"("dreamId", "createdAt");

-- CreateIndex
CREATE INDEX "Share_userId_idx" ON "Share"("userId");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
