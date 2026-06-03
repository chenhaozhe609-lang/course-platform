import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const courses = [
  { courseNo: "MATH101", name: "高等数学（上）", teacher: "张伟", department: "数学学院", credit: 5, type: "required" },
  { courseNo: "PHYS102", name: "大学物理", teacher: "李娜", department: "物理学院", credit: 4, type: "required" },
  { courseNo: "CS201", name: "数据结构", teacher: "王强", department: "计算机学院", credit: 3, type: "required" },
  { courseNo: "CS305", name: "机器学习导论", teacher: "陈静", department: "计算机学院", credit: 3, type: "elective" },
  { courseNo: "GE110", name: "西方艺术史", teacher: "刘洋", department: "人文学院", credit: 2, type: "general" },
];

async function main() {
  let created = 0;
  for (const c of courses) {
    const existing = await prisma.course.findFirst({
      where: { name: c.name, teacher: c.teacher },
    });
    if (existing) continue;
    await prisma.course.create({ data: { ...c, status: "published" } });
    created++;
  }
  console.log(`Seed done. Created ${created} new course(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
