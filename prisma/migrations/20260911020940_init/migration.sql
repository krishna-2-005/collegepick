-- CreateEnum
CREATE TYPE "Ownership" AS ENUM ('PUBLIC', 'PRIVATE', 'DEEMED');

-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('BTECH', 'MTECH', 'MBA', 'MBBS', 'BSC', 'BCOM', 'BA');

-- CreateEnum
CREATE TYPE "Exam" AS ENUM ('JEE_MAIN', 'JEE_ADV', 'NEET', 'CAT', 'GATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "ownership" "Ownership" NOT NULL,
    "establishedYear" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "minFees" INTEGER NOT NULL,
    "maxFees" INTEGER NOT NULL,
    "overview" TEXT NOT NULL,
    "website" TEXT,
    "imageUrl" TEXT NOT NULL,
    "nirfRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree" "Degree" NOT NULL,
    "durationYears" INTEGER NOT NULL,
    "totalFees" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "avgPackageLPA" DOUBLE PRECISION NOT NULL,
    "medianPackageLPA" DOUBLE PRECISION NOT NULL,
    "highestPackageLPA" DOUBLE PRECISION NOT NULL,
    "placementRate" DOUBLE PRECISION NOT NULL,
    "topRecruiters" TEXT[],
    "year" INTEGER NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamCutoff" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "exam" "Exam" NOT NULL,
    "closingRank" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "ExamCutoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCollege" (
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCollege_pkey" PRIMARY KEY ("userId","collegeId")
);

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeIds" TEXT[],
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedComparison_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "College_city_idx" ON "College"("city");

-- CreateIndex
CREATE INDEX "College_rating_idx" ON "College"("rating");

-- CreateIndex
CREATE INDEX "College_minFees_idx" ON "College"("minFees");

-- CreateIndex
CREATE INDEX "Course_collegeId_idx" ON "Course"("collegeId");

-- CreateIndex
CREATE INDEX "Course_degree_idx" ON "Course"("degree");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_collegeId_key" ON "Placement"("collegeId");

-- CreateIndex
CREATE INDEX "Placement_avgPackageLPA_idx" ON "Placement"("avgPackageLPA");

-- CreateIndex
CREATE INDEX "Review_collegeId_createdAt_idx" ON "Review"("collegeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_collegeId_userId_key" ON "Review"("collegeId", "userId");

-- CreateIndex
CREATE INDEX "ExamCutoff_collegeId_idx" ON "ExamCutoff"("collegeId");

-- CreateIndex
CREATE INDEX "ExamCutoff_exam_closingRank_idx" ON "ExamCutoff"("exam", "closingRank");

-- CreateIndex
CREATE INDEX "SavedComparison_userId_createdAt_idx" ON "SavedComparison"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamCutoff" ADD CONSTRAINT "ExamCutoff_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCollege" ADD CONSTRAINT "SavedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedComparison" ADD CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
