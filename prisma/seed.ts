import { PrismaClient, ExperienceLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting WorldTree genealogy database seeding...');

  // Create demo users
  console.log('👥 Creating demo users...');
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@worldtree.app' },
    update: {},
    create: {
      email: 'demo@worldtree.app',
      name: 'Demo User',
      username: 'demo',
      isVerified: true,
      genealogyExperience: ExperienceLevel.BEGINNER,
      heritagePoints: 150,
      level: 2,
      onboardingCompleted: true,
      hasCompletedQuiz: true
    }
  });

  const businessUser = await prisma.user.upsert({
    where: { email: 'business@worldtree.app' },
    update: {},
    create: {
      email: 'business@worldtree.app',
      name: 'Business User',
      username: 'business',
      isVerified: true,
      genealogyExperience: ExperienceLevel.INTERMEDIATE,
      heritagePoints: 500,
      level: 5,
      onboardingCompleted: true,
      hasCompletedQuiz: true
    }
  });

  const enterpriseUser = await prisma.user.upsert({
    where: { email: 'enterprise@worldtree.app' },
    update: {},
    create: {
      email: 'enterprise@worldtree.app',
      name: 'Enterprise User',
      username: 'enterprise',
      isVerified: true,
      genealogyExperience: ExperienceLevel.EXPERT,
      heritagePoints: 1000,
      level: 10,
      onboardingCompleted: true,
      hasCompletedQuiz: true
    }
  });

  console.log('✅ Created demo users:', { 
    demo: demoUser.id, 
    business: businessUser.id, 
    enterprise: enterpriseUser.id 
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 