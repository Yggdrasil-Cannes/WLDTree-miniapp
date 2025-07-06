const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('🗑️  Clearing all users from database...');
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    
    console.log(`✅ Deleted ${deletedUsers.count} users from database`);
    console.log('🎉 Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers(); 