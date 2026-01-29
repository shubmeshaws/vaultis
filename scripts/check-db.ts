
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.database.count()
    console.log(`Database count: ${count}`)
    const dbs = await prisma.database.findMany()
    console.log('Databases:', JSON.stringify(dbs, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
