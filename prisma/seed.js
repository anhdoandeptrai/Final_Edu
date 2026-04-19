const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const demoPasswordHash = await hash("123456", 12);

  const teacher = await prisma.appUser.upsert({
    where: { email: "teacher.demo@final-edu.local" },
    update: {
      name: "Co Lan",
      passwordHash: demoPasswordHash,
      role: "teacher",
    },
    create: {
      name: "Co Lan",
      email: "teacher.demo@final-edu.local",
      passwordHash: demoPasswordHash,
      role: "teacher",
    },
  });

  const student = await prisma.appUser.upsert({
    where: { email: "student.demo@final-edu.local" },
    update: {
      name: "Nguyen Van A",
      passwordHash: demoPasswordHash,
      role: "student",
    },
    create: {
      name: "Nguyen Van A",
      email: "student.demo@final-edu.local",
      passwordHash: demoPasswordHash,
      role: "student",
    },
  });

  const teacherClassCount = await prisma.lmsClass.count({
    where: { teacherId: teacher.id },
  });

  if (teacherClassCount > 0) {
    console.log("LMS seed skipped: demo teacher already has class data.");
    console.log("Demo accounts ready:");
    console.log("- teacher.demo@final-edu.local / 123456");
    console.log("- student.demo@final-edu.local / 123456");
    return;
  }

  async function generateJoinCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const code = `D${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const exists = await prisma.lmsClass.findUnique({
        where: { joinCode: code },
        select: { id: true },
      });

      if (!exists) {
        return code;
      }
    }

    return `D${Date.now().toString(36).slice(-5).toUpperCase()}`;
  }

  const createdClass = await prisma.lmsClass.create({
    data: {
      name: "Lop Demo Toan 10",
      description: "Lop mau de test LMS voi PostgreSQL",
      teacherId: teacher.id,
      teacherName: teacher.name,
      joinCode: await generateJoinCode(),
      enrollments: {
        create: [{ studentId: student.id }],
      },
    },
  });

  const assignment = await prisma.lmsAssignment.create({
    data: {
      classId: createdClass.id,
      title: "Bai tap he phuong trinh",
      instructions: "Giai 5 bai trong giao trinh va nop dap an.",
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxScore: 10,
      createdBy: teacher.id,
    },
  });

  await prisma.lmsSubmission.create({
    data: {
      assignmentId: assignment.id,
      classId: createdClass.id,
      studentId: student.id,
      studentName: student.name,
      content: "Da nop bai day du theo yeu cau.",
      status: "submitted",
    },
  });

  await prisma.lmsLesson.create({
    data: {
      classId: createdClass.id,
      title: "Nhap mon he phuong trinh",
      description: "Tong quan kien thuc co ban",
      content: "Noi dung bai hoc demo cho he thong LMS.",
      createdBy: teacher.id,
    },
  });

  console.log("LMS seed completed.");
  console.log("Demo accounts:");
  console.log("- teacher.demo@final-edu.local / 123456");
  console.log("- student.demo@final-edu.local / 123456");
}

main()
  .catch((error) => {
    console.error("LMS seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
