const fs = require("fs");
const path = require("path");
const { hash } = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const LEGACY_FILE = path.join(process.cwd(), "data", "lms-store.json");

function toDate(timestamp) {
  if (!timestamp || Number.isNaN(Number(timestamp))) {
    return new Date();
  }
  return new Date(Number(timestamp));
}

async function ensureUser({ id, name, role }) {
  const safeRole = role === "teacher" ? "teacher" : "student";
  const fallbackEmail = `${id}@legacy.local`;
  const passwordHash = await hash("123456", 12);

  return prisma.appUser.upsert({
    where: { id },
    update: {
      name,
      role: safeRole,
    },
    create: {
      id,
      name,
      email: fallbackEmail,
      passwordHash,
      role: safeRole,
    },
  });
}

async function main() {
  if (!fs.existsSync(LEGACY_FILE)) {
    console.log("Legacy file not found:", LEGACY_FILE);
    return;
  }

  const raw = fs.readFileSync(LEGACY_FILE, "utf8");
  const legacy = JSON.parse(raw || "{}");

  const classes = legacy.classes || [];
  const lessons = legacy.lessons || [];
  const assignments = legacy.assignments || [];
  const submissions = legacy.submissions || [];

  if (
    classes.length === 0 &&
    lessons.length === 0 &&
    assignments.length === 0 &&
    submissions.length === 0
  ) {
    console.log("Legacy LMS store is empty. Nothing to migrate.");
    return;
  }

  for (const cls of classes) {
    await ensureUser({
      id: cls.teacherId,
      name: cls.teacherName || "Teacher",
      role: "teacher",
    });

    await prisma.lmsClass.upsert({
      where: { id: cls.id },
      update: {
        name: cls.name,
        description: cls.description || "",
        teacherId: cls.teacherId,
        teacherName: cls.teacherName || "Teacher",
        joinCode:
          String(cls.joinCode || "").toUpperCase() ||
          `L${String(cls.id).slice(-5).toUpperCase()}`,
        createdAt: toDate(cls.createdAt),
      },
      create: {
        id: cls.id,
        name: cls.name,
        description: cls.description || "",
        teacherId: cls.teacherId,
        teacherName: cls.teacherName || "Teacher",
        joinCode:
          String(cls.joinCode || "").toUpperCase() ||
          `L${String(cls.id).slice(-5).toUpperCase()}`,
        createdAt: toDate(cls.createdAt),
      },
    });

    for (const studentId of cls.studentIds || []) {
      await ensureUser({
        id: studentId,
        name: `Student ${studentId.slice(-4)}`,
        role: "student",
      });

      await prisma.lmsClassEnrollment.upsert({
        where: {
          classId_studentId: {
            classId: cls.id,
            studentId,
          },
        },
        update: {},
        create: {
          classId: cls.id,
          studentId,
          createdAt: toDate(cls.createdAt),
        },
      });
    }
  }

  for (const lesson of lessons) {
    await prisma.lmsLesson.upsert({
      where: { id: lesson.id },
      update: {
        classId: lesson.classId,
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        resourceUrl: lesson.resourceUrl || null,
        createdBy: lesson.createdBy || "",
        createdAt: toDate(lesson.createdAt),
      },
      create: {
        id: lesson.id,
        classId: lesson.classId,
        title: lesson.title,
        description: lesson.description || "",
        content: lesson.content || "",
        resourceUrl: lesson.resourceUrl || null,
        createdBy: lesson.createdBy || "",
        createdAt: toDate(lesson.createdAt),
      },
    });
  }

  for (const assignment of assignments) {
    await prisma.lmsAssignment.upsert({
      where: { id: assignment.id },
      update: {
        classId: assignment.classId,
        title: assignment.title,
        instructions: assignment.instructions || "",
        dueAt: toDate(assignment.dueAt),
        maxScore: Number(assignment.maxScore || 10),
        createdBy: assignment.createdBy || "",
        createdAt: toDate(assignment.createdAt),
      },
      create: {
        id: assignment.id,
        classId: assignment.classId,
        title: assignment.title,
        instructions: assignment.instructions || "",
        dueAt: toDate(assignment.dueAt),
        maxScore: Number(assignment.maxScore || 10),
        createdBy: assignment.createdBy || "",
        createdAt: toDate(assignment.createdAt),
      },
    });
  }

  for (const submission of submissions) {
    await ensureUser({
      id: submission.studentId,
      name:
        submission.studentName || `Student ${submission.studentId.slice(-4)}`,
      role: "student",
    });

    await prisma.lmsSubmission.upsert({
      where: { id: submission.id },
      update: {
        assignmentId: submission.assignmentId,
        classId: submission.classId,
        studentId: submission.studentId,
        studentName: submission.studentName || "",
        content: submission.content || "",
        submittedAt: toDate(submission.submittedAt),
        status: submission.status === "reviewed" ? "reviewed" : "submitted",
        reviewedAt: submission.reviewedAt
          ? toDate(submission.reviewedAt)
          : null,
        score: typeof submission.score === "number" ? submission.score : null,
        feedback: submission.feedback || null,
      },
      create: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        classId: submission.classId,
        studentId: submission.studentId,
        studentName: submission.studentName || "",
        content: submission.content || "",
        submittedAt: toDate(submission.submittedAt),
        status: submission.status === "reviewed" ? "reviewed" : "submitted",
        reviewedAt: submission.reviewedAt
          ? toDate(submission.reviewedAt)
          : null,
        score: typeof submission.score === "number" ? submission.score : null,
        feedback: submission.feedback || null,
      },
    });
  }

  console.log("Legacy LMS JSON migration completed successfully.");
}

main()
  .catch((error) => {
    console.error("Legacy LMS JSON migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
