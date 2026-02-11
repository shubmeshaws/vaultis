
import { prisma } from '../src/lib/db/prisma'

async function main() {
  console.log('--- Testing Group Update ---')

  // 1. Create Dummy User
  const user = await prisma.user.upsert({
    where: { email: 'test_group_user@example.com' },
    update: {},
    create: {
      email: 'test_group_user@example.com',
      name: 'Test Group User'
    }
  })
  console.log('User:', user.id)

  // 2. Create Dummy Group
  const group = await prisma.group.upsert({
    where: { name: 'Test Group' },
    update: {},
    create: {
      name: 'Test Group'
    }
  })
  console.log('Group:', group.id)

  // 3. Assign User to Group using the same logic as userActions.ts
  console.log('Assigning user to group...')
  try {
      await prisma.group.update({
        where: { id: group.id },
        data: {
            users: {
                set: [{ id: user.id }]
            }
        },
      })
      console.log('Update command executed.')
  } catch (e) {
      console.error('Update failed:', e)
  }

  // 4. Verify
  const updatedGroup = await prisma.group.findUnique({
      where: { id: group.id },
      include: { users: true }
  })
  console.log('Updated Group Users:', updatedGroup?.users.map(u => u.email).join(', '))

  const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { groups: true }
  })
  console.log('Updated User Groups:', updatedUser?.groups.map(g => g.name).join(', '))

  // Cleanup
  console.log('Cleaning up...')
  await prisma.user.delete({ where: { id: user.id } })
  await prisma.group.delete({ where: { id: group.id } })
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
