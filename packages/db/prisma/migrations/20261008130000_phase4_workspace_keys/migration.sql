-- P4-B1 follow-up: the phase 4 models follow the workspace-key rules (packages/db schema test):
-- links between workspace-owned rows use composite keys, Task.postId has no foreign key (like
-- Post.recurringRuleId) and MemberAccountAccess gets an id. The table is still empty.

-- DropForeignKey
ALTER TABLE "AiJob" DROP CONSTRAINT "AiJob_refinesJobId_fkey";

-- DropForeignKey
ALTER TABLE "MediaAsset" DROP CONSTRAINT "MediaAsset_aiJobId_fkey";

-- DropForeignKey
ALTER TABLE "PostComment" DROP CONSTRAINT "PostComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_postId_fkey";

-- AlterTable
ALTER TABLE "MemberAccountAccess" DROP CONSTRAINT "MemberAccountAccess_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "MemberAccountAccess_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAccountAccess_memberId_socialAccountId_key" ON "MemberAccountAccess"("memberId", "socialAccountId");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_aiJobId_workspaceId_fkey" FOREIGN KEY ("aiJobId", "workspaceId") REFERENCES "AiJob"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_workspaceId_fkey" FOREIGN KEY ("parentId", "workspaceId") REFERENCES "PostComment"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_refinesJobId_workspaceId_fkey" FOREIGN KEY ("refinesJobId", "workspaceId") REFERENCES "AiJob"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE CASCADE;
