-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldcoinId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "username" TEXT,
    "walletAddress" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "bio" TEXT,
    "region" TEXT,
    "preferences" JSONB,
    "genealogyExperience" TEXT NOT NULL DEFAULT 'BEGINNER',
    "researchGoals" JSONB,
    "heritagePoints" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badges" JSONB,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "hasCompletedQuiz" BOOLEAN NOT NULL DEFAULT false,
    "hasMintedBadge" BOOLEAN NOT NULL DEFAULT false,
    "badgeTransactionId" TEXT,
    "badgeMintedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "family_trees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "rootPersonId" TEXT,
    "generations" INTEGER NOT NULL DEFAULT 1,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "collaborators" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "family_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "maidenName" TEXT,
    "nicknames" JSONB,
    "gender" TEXT,
    "birthDate" DATETIME,
    "birthPlace" TEXT,
    "deathDate" DATETIME,
    "deathPlace" TEXT,
    "isLiving" BOOLEAN NOT NULL DEFAULT true,
    "occupation" TEXT,
    "education" TEXT,
    "religion" TEXT,
    "notes" TEXT,
    "sources" JSONB,
    "photos" JSONB,
    "documents" JSONB,
    "x" REAL NOT NULL DEFAULT 0,
    "y" REAL NOT NULL DEFAULT 0,
    "z" REAL NOT NULL DEFAULT 0,
    "confidence" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "family_members_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "family_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "family_relationships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treeId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "place" TEXT,
    "confidence" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sources" JSONB,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "family_relationships_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "family_trees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "family_relationships_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "family_relationships_childId_fkey" FOREIGN KEY ("childId") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dna_uploads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedAt" DATETIME,
    "testingCompany" TEXT,
    "testDate" DATETIME,
    "totalSNPs" INTEGER,
    "ethnicity" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dna_uploads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dna_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadId" TEXT NOT NULL,
    "person1Id" TEXT NOT NULL,
    "person2Id" TEXT NOT NULL,
    "sharedCM" REAL,
    "sharedSegments" INTEGER,
    "longestSegment" REAL,
    "estimatedRelationship" TEXT,
    "confidence" REAL,
    "matchDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "dna_matches_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "dna_uploads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dna_matches_person1Id_fkey" FOREIGN KEY ("person1Id") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dna_matches_person2Id_fkey" FOREIGN KEY ("person2Id") REFERENCES "family_members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "research_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "researchType" TEXT NOT NULL,
    "targetPersonId" TEXT,
    "targetLocation" TEXT,
    "targetTimeframe" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "findings" JSONB,
    "sources" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "research_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "heritagePointsEarned" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "badge_mints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL DEFAULT 'HeritageExplorer',
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "blockNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nullifierHash" TEXT,
    "userAddress" TEXT NOT NULL,
    "network" TEXT NOT NULL DEFAULT 'World Chain Sepolia',
    "mintedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    CONSTRAINT "badge_mints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_worldcoinId_key" ON "users"("worldcoinId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_worldcoinId_idx" ON "users"("worldcoinId");

-- CreateIndex
CREATE INDEX "family_trees_userId_idx" ON "family_trees"("userId");

-- CreateIndex
CREATE INDEX "family_members_treeId_idx" ON "family_members"("treeId");

-- CreateIndex
CREATE INDEX "family_members_userId_idx" ON "family_members"("userId");

-- CreateIndex
CREATE INDEX "family_members_firstName_lastName_idx" ON "family_members"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "family_members_birthDate_idx" ON "family_members"("birthDate");

-- CreateIndex
CREATE INDEX "family_relationships_treeId_idx" ON "family_relationships"("treeId");

-- CreateIndex
CREATE INDEX "family_relationships_parentId_idx" ON "family_relationships"("parentId");

-- CreateIndex
CREATE INDEX "family_relationships_childId_idx" ON "family_relationships"("childId");

-- CreateIndex
CREATE INDEX "family_relationships_relationshipType_idx" ON "family_relationships"("relationshipType");

-- CreateIndex
CREATE INDEX "dna_uploads_userId_idx" ON "dna_uploads"("userId");

-- CreateIndex
CREATE INDEX "dna_uploads_status_idx" ON "dna_uploads"("status");

-- CreateIndex
CREATE INDEX "dna_matches_uploadId_idx" ON "dna_matches"("uploadId");

-- CreateIndex
CREATE INDEX "dna_matches_person1Id_idx" ON "dna_matches"("person1Id");

-- CreateIndex
CREATE INDEX "dna_matches_person2Id_idx" ON "dna_matches"("person2Id");

-- CreateIndex
CREATE INDEX "dna_matches_sharedCM_idx" ON "dna_matches"("sharedCM");

-- CreateIndex
CREATE INDEX "research_logs_userId_idx" ON "research_logs"("userId");

-- CreateIndex
CREATE INDEX "research_logs_status_idx" ON "research_logs"("status");

-- CreateIndex
CREATE INDEX "research_logs_researchType_idx" ON "research_logs"("researchType");

-- CreateIndex
CREATE INDEX "user_activities_userId_idx" ON "user_activities"("userId");

-- CreateIndex
CREATE INDEX "user_activities_activityType_idx" ON "user_activities"("activityType");

-- CreateIndex
CREATE INDEX "user_activities_createdAt_idx" ON "user_activities"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badge_mints_transactionId_key" ON "badge_mints"("transactionId");

-- CreateIndex
CREATE INDEX "badge_mints_userId_idx" ON "badge_mints"("userId");

-- CreateIndex
CREATE INDEX "badge_mints_transactionId_idx" ON "badge_mints"("transactionId");

-- CreateIndex
CREATE INDEX "badge_mints_status_idx" ON "badge_mints"("status");
