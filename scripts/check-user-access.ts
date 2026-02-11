
import { prisma } from '../src/lib/db/prisma'

async function main() {
  console.log('--- Checking User Access ---')
  
  const users = await prisma.user.findMany({
    include: {
      groups: {
        include: {
          databases: {
            select: { name: true }
          }
        }
      },
      directDatabases: {
        select: { name: true }
      }
    }
  })

  for (const user of users) {
    console.log(`\nUser: ${user.email} (${user.role})`)
    console.log(`  Groups: ${user.groups.map(g => g.name).join(', ') || 'None'}`)
    
    const groupDbs = user.groups.flatMap(g => g.databases.map(d => d.name))
    console.log(`  Databases via Groups: ${groupDbs.join(', ') || 'None'}`)
    
    const directDbs = user.directDatabases.map(d => d.name)
    console.log(`  Direct Databases: ${directDbs.join(', ') || 'None'}`)
  }

  console.log('\n--- Done ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
