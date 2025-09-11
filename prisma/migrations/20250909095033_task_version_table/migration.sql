/*
  Warnings:

  - You are about to drop the column `memberEmails` on the `workspaces` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."spaces_spaceNumber_key";

-- AlterTable
ALTER TABLE "public"."tasks" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."workspaces" DROP COLUMN "memberEmails";

-- CreateTable
CREATE TABLE "public"."task_versions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "comment" TEXT,
    "status" "public"."TaskStatus" NOT NULL,
    "priority" "public"."Priority" NOT NULL,
    "tags" TEXT[],
    "dueDate" TIMESTAMP(3),
    "taskNumber" INTEGER NOT NULL,
    "spaceId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "reporterId" TEXT NOT NULL,
    "taskCreatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updateReason" TEXT,
    "versionCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_versions_taskId_idx" ON "public"."task_versions"("taskId");

-- CreateIndex
CREATE INDEX "task_versions_version_idx" ON "public"."task_versions"("version");

-- CreateIndex
CREATE INDEX "task_versions_versionCreatedAt_idx" ON "public"."task_versions"("versionCreatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "task_versions_taskId_version_key" ON "public"."task_versions"("taskId", "version");

-- CreateIndex
CREATE INDEX "tasks_version_idx" ON "public"."tasks"("version");

-- AddForeignKey
ALTER TABLE "public"."task_versions" ADD CONSTRAINT "task_versions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task_versions" ADD CONSTRAINT "task_versions_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
