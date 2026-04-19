-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."LmsSubmissionStatus" AS ENUM ('submitted', 'reviewed');

-- CreateTable
CREATE TABLE "public"."LmsClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LmsClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LmsClassEnrollment" (
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LmsClassEnrollment_pkey" PRIMARY KEY ("classId","studentId")
);

-- CreateTable
CREATE TABLE "public"."LmsLesson" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resourceUrl" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LmsLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LmsAssignment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LmsAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LmsSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."LmsSubmissionStatus" NOT NULL DEFAULT 'submitted',
    "reviewedAt" TIMESTAMP(3),
    "score" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "LmsSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LmsClass_joinCode_key" ON "public"."LmsClass"("joinCode");

-- CreateIndex
CREATE INDEX "LmsClass_teacherId_idx" ON "public"."LmsClass"("teacherId");

-- CreateIndex
CREATE INDEX "LmsClassEnrollment_studentId_idx" ON "public"."LmsClassEnrollment"("studentId");

-- CreateIndex
CREATE INDEX "LmsLesson_classId_idx" ON "public"."LmsLesson"("classId");

-- CreateIndex
CREATE INDEX "LmsAssignment_classId_idx" ON "public"."LmsAssignment"("classId");

-- CreateIndex
CREATE INDEX "LmsSubmission_assignmentId_idx" ON "public"."LmsSubmission"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "LmsSubmission_assignmentId_studentId_key" ON "public"."LmsSubmission"("assignmentId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."LmsClassEnrollment" ADD CONSTRAINT "LmsClassEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."LmsClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LmsLesson" ADD CONSTRAINT "LmsLesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."LmsClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LmsAssignment" ADD CONSTRAINT "LmsAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."LmsClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LmsSubmission" ADD CONSTRAINT "LmsSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."LmsAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LmsSubmission" ADD CONSTRAINT "LmsSubmission_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."LmsClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

