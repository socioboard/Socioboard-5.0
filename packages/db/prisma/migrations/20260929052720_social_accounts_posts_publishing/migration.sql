-- CreateEnum
CREATE TYPE "LoginProvider" AS ENUM ('facebook', 'instagram', 'linkedin', 'x', 'youtube', 'pinterest', 'tiktok', 'snapchat', 'tumblr');

-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('facebook_page', 'instagram', 'linkedin_person', 'linkedin_org', 'x', 'youtube', 'pinterest', 'tiktok', 'snapchat', 'tumblr');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('active', 'reauth_required', 'revoked');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'reauth_required', 'disconnected', 'paused');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'in_review', 'approved', 'scheduled', 'publishing', 'published', 'partial', 'failed');

-- CreateEnum
CREATE TYPE "TargetStatus" AS ENUM ('pending', 'scheduled', 'publishing', 'published', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "PublishOutcome" AS ENUM ('running', 'published', 'failed', 'will_retry');

-- CreateEnum
CREATE TYPE "PublishErrorKind" AS ENUM ('retryable', 'rate_limited', 'auth', 'content');

-- CreateTable
CREATE TABLE "SocialConnection" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "provider" "LoginProvider" NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "status" "ConnectionStatus" NOT NULL DEFAULT 'active',
    "statusReason" TEXT,
    "connectedById" UUID,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "connectionId" UUID,
    "network" "SocialNetwork" NOT NULL,
    "externalId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "assetTokenEnc" TEXT,
    "assetTokenExpiresAt" TIMESTAMP(3),
    "meta" JSONB NOT NULL DEFAULT '{}',
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "statusReason" TEXT,
    "connectedById" UUID,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccountGroup" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAccountGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccountGroupItem" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "groupId" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,

    CONSTRAINT "SocialAccountGroupItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthState" (
    "id" UUID NOT NULL,
    "state" TEXT NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "LoginProvider" NOT NULL,
    "pkceVerifier" TEXT,
    "connectionId" UUID,
    "forceAccountSelection" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "authorId" UUID,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "text" TEXT NOT NULL DEFAULT '',
    "mediaIds" UUID[],
    "link" TEXT,
    "firstComment" TEXT,
    "labelIds" UUID[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTarget" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "socialAccountId" UUID NOT NULL,
    "override" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "scheduleVersion" INTEGER NOT NULL DEFAULT 0,
    "status" "TargetStatus" NOT NULL DEFAULT 'pending',
    "externalPostId" TEXT,
    "permalink" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishAttempt" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "postTargetId" UUID NOT NULL,
    "attemptNo" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "outcome" "PublishOutcome" NOT NULL DEFAULT 'running',
    "errorKind" "PublishErrorKind",
    "networkCode" TEXT,
    "message" TEXT,
    "costUnits" DOUBLE PRECISION,

    CONSTRAINT "PublishAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_id_workspaceId_key" ON "SocialConnection"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialConnection_workspaceId_provider_externalUserId_key" ON "SocialConnection"("workspaceId", "provider", "externalUserId");

-- CreateIndex
CREATE INDEX "SocialAccount_connectionId_idx" ON "SocialAccount"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_id_workspaceId_key" ON "SocialAccount"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspaceId_network_externalId_key" ON "SocialAccount"("workspaceId", "network", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccountGroup_id_workspaceId_key" ON "SocialAccountGroup"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "SocialAccountGroupItem_socialAccountId_idx" ON "SocialAccountGroupItem"("socialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccountGroupItem_groupId_socialAccountId_key" ON "SocialAccountGroupItem"("groupId", "socialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthState_state_key" ON "OAuthState"("state");

-- CreateIndex
CREATE INDEX "OAuthState_expiresAt_idx" ON "OAuthState"("expiresAt");

-- CreateIndex
CREATE INDEX "Post_workspaceId_createdAt_idx" ON "Post"("workspaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_workspaceId_status_idx" ON "Post"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Post_mediaIds_idx" ON "Post" USING GIN ("mediaIds");

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_workspaceId_key" ON "Post"("id", "workspaceId");

-- CreateIndex
CREATE INDEX "PostTarget_socialAccountId_status_idx" ON "PostTarget"("socialAccountId", "status");

-- CreateIndex
CREATE INDEX "PostTarget_status_scheduledAt_idx" ON "PostTarget"("status", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "PostTarget_id_workspaceId_key" ON "PostTarget"("id", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTarget_postId_socialAccountId_key" ON "PostTarget"("postId", "socialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishAttempt_postTargetId_attemptNo_key" ON "PublishAttempt"("postTargetId", "attemptNo");

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialConnection" ADD CONSTRAINT "SocialConnection_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_connectionId_workspaceId_fkey" FOREIGN KEY ("connectionId", "workspaceId") REFERENCES "SocialConnection"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccountGroup" ADD CONSTRAINT "SocialAccountGroup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccountGroupItem" ADD CONSTRAINT "SocialAccountGroupItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccountGroupItem" ADD CONSTRAINT "SocialAccountGroupItem_groupId_workspaceId_fkey" FOREIGN KEY ("groupId", "workspaceId") REFERENCES "SocialAccountGroup"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccountGroupItem" ADD CONSTRAINT "SocialAccountGroupItem_socialAccountId_workspaceId_fkey" FOREIGN KEY ("socialAccountId", "workspaceId") REFERENCES "SocialAccount"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthState" ADD CONSTRAINT "OAuthState_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthState" ADD CONSTRAINT "OAuthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuthState" ADD CONSTRAINT "OAuthState_connectionId_workspaceId_fkey" FOREIGN KEY ("connectionId", "workspaceId") REFERENCES "SocialConnection"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTarget" ADD CONSTRAINT "PostTarget_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTarget" ADD CONSTRAINT "PostTarget_postId_workspaceId_fkey" FOREIGN KEY ("postId", "workspaceId") REFERENCES "Post"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTarget" ADD CONSTRAINT "PostTarget_socialAccountId_workspaceId_fkey" FOREIGN KEY ("socialAccountId", "workspaceId") REFERENCES "SocialAccount"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_postTargetId_workspaceId_fkey" FOREIGN KEY ("postTargetId", "workspaceId") REFERENCES "PostTarget"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;
