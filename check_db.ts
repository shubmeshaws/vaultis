import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const dbs = await prisma.database.findMany({ select: { name: true, version: true }})
  console.log(JSON.stringify(dbs, null, 2))
}
main()
