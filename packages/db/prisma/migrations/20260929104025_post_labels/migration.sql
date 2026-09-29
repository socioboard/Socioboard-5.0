-- CreateEnum
CREATE TYPE "LabelColor" AS ENUM ('gray', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'indigo', 'violet', 'pink');

-- CreateTable
CREATE TABLE "PostLabel" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color" "LabelColor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostLabel_workspaceId_name_key" ON "PostLabel"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Post_labelIds_idx" ON "Post" USING GIN ("labelIds");

-- AddForeignKey
ALTER TABLE "PostLabel" ADD CONSTRAINT "PostLabel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
