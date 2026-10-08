-- P4-B1: review history, comments, tasks, AI jobs and per-member account access.

-- CreateEnum
CREATE TYPE "ReviewAction" AS ENUM ('submitted', 'approved', 'changes_requested', 'withdrawn');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('open', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "AiJobType" AS ENUM ('text', 'image', 'video');

-- CreateEnum
CREATE TYPE "AiJobStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "accountsLimited" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MemberAccountAccess" (
    "workspaceId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberAccountAccess_pkey" PRIMARY KEY ("memberId","socialAccountId")
);

-- CreateTable
CREATE TABLE "PostApproval" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "actorId" UUID,
    "action" "ReviewAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "parentId" UUID,
    "authorId" UUID,
    "body" TEXT NOT NULL,
    "mentionedUserIds" UUID[],
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "postId" UUID,
    "assigneeId" UUID,
    "createdById" UUID,
    "dueAt" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'open',
    "completedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiJob" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID,
    "type" "AiJobType" NOT NULL,
    "input" JSONB NOT NULL,
    "targetNetworks" "SocialNetwork"[],
    "refinesJobId" UUID,
    "instruction" TEXT,
    "status" "AiJobStatus" NOT NULL DEFAULT 'queued',
    "progress" DOUBLE PRECISION,
    "externalJobId" TEXT,
    "text" TEXT[],
    "usage" JSONB,
    "creditsUsed" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AiJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberAccountAccess_socialAccountId_idx" ON "MemberAccountAccess"("socialAccountId");

-- CreateIndex
CREATE INDEX "PostApproval_postId_createdAt_idx" ON "PostApproval"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostApproval_workspaceId_action_createdAt_idx" ON "PostApproval"("workspaceId", "action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PostComment_postId_createdAt_idx" ON "PostComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostComment_mentionedUserIds_idx" ON "PostComment" USING GIN ("mentionedUserIds");

-- CreateIndex
CREATE UNIQUE INDEX "PostComment_id_workspaceId_key" ON "PostComment"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "Task_workspaceId_status_dueAt_idx" ON "Task"("workspaceId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Task_assigneeId_status_idx" ON "Task"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "Task_postId_idx" ON "Task"("postId");

-- CreateIndex
CREATE INDEX "Task_status_dueAt_idx" ON "Task"("status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_workspaceId_key" ON "Task"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AiJob_externalJobId_key" ON "AiJob"("externalJobId");

-- CreateIndex
CREATE INDEX "AiJob_workspaceId_userId_createdAt_idx" ON "AiJob"("workspaceId", "userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AiJob_status_updatedAt_idx" ON "AiJob"("status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiJob_id_workspaceId_key" ON "AiJob"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "MediaAsset_aiJobId_idx" ON "MediaAsset"("aiJobId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_id_workspaceId_key" ON "Member"("id", "workspaceId");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "AiJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAccountAccess" ADD CONSTRAINT "MemberAccountAccess_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAccountAccess" ADD CONSTRAINT "MemberAccountAccess_memberId_workspaceId_fkey" FOREIGN KEY ("memberId", "workspaceId") REFERENCES "Member"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberAccountAccess" ADD CONSTRAINT "MemberAccountAccess_socialAccountId_workspaceId_fkey" FOREIGN KEY ("socialAccountId", "workspaceId") REFERENCES "SocialAccount"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostApproval" ADD CONSTRAINT "PostApproval_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostApproval" ADD CONSTRAINT "PostApproval_postId_workspaceId_fkey" FOREIGN KEY ("postId", "workspaceId") REFERENCES "Post"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostApproval" ADD CONSTRAINT "PostApproval_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_workspaceId_fkey" FOREIGN KEY ("postId", "workspaceId") REFERENCES "Post"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiJob" ADD CONSTRAINT "AiJob_refinesJobId_fkey" FOREIGN KEY ("refinesJobId") REFERENCES "AiJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
