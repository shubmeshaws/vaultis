import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding databases...')

    const databases = [
        { name: 'Production DB', type: 'postgres', host: 'prod-db.example.com', port: 5432, description: 'Primary production database' },
        { name: 'Analytics DB', type: 'snowflake', host: 'warehouse.example.com', port: 443, description: 'Data warehouse for analytics' },
        { name: 'Staging DB', type: 'mysql', host: 'staging.example.com', port: 3306, description: 'Staging environment database' },
        { name: 'Legacy DB', type: 'mongo', host: 'legacy.example.com', port: 27017, description: 'Legacy system data' },
    ]

    for (const db of databases) {
        await prisma.database.upsert({
            where: { name: db.name },
            update: {},
            create: db,
        })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
