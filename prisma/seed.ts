import { PrismaClient, Role, GoalType, DietType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Seed Plans & Feature Quotas
  const freePlan = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      price: 0,
      isDefault: true,
      features: {
        create: [
          { featureKey: 'food_scan', isEnabled: true, limitValue: 5 },
          { featureKey: 'ai_chat', isEnabled: true, limitValue: 20 },
          { featureKey: 'expense_tracking', isEnabled: true, limitValue: null },
          { featureKey: 'meal_recommendation', isEnabled: false, limitValue: 0 },
          { featureKey: 'workout_recommendation', isEnabled: false, limitValue: 0 },
          { featureKey: 'weekly_report', isEnabled: false, limitValue: 0 },
        ],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      price: 299,
      isDefault: false,
      features: {
        create: [
          { featureKey: 'food_scan', isEnabled: true, limitValue: 100 },
          { featureKey: 'ai_chat', isEnabled: true, limitValue: 200 },
          { featureKey: 'expense_tracking', isEnabled: true, limitValue: null },
          { featureKey: 'meal_recommendation', isEnabled: true, limitValue: null },
          { featureKey: 'workout_recommendation', isEnabled: true, limitValue: null },
          { featureKey: 'weekly_report', isEnabled: true, limitValue: null },
        ],
      },
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      price: 599,
      isDefault: false,
      features: {
        create: [
          { featureKey: 'food_scan', isEnabled: true, limitValue: null },
          { featureKey: 'ai_chat', isEnabled: true, limitValue: null },
          { featureKey: 'expense_tracking', isEnabled: true, limitValue: null },
          { featureKey: 'meal_recommendation', isEnabled: true, limitValue: null },
          { featureKey: 'workout_recommendation', isEnabled: true, limitValue: null },
          { featureKey: 'weekly_report', isEnabled: true, limitValue: null },
        ],
      },
    },
  });

  // 2. Seed Default Exercises
  const defaultExercises = [
    {
      name: 'Bodyweight Squats',
      description: 'A fundamental lower body movement targeting quadriceps, hamstrings, and glutes.',
      category: 'Strength',
      muscleGroup: 'Legs',
      difficulty: 'Beginner',
      equipment: 'Bodyweight',
      instructions: 'Stand with feet shoulder-width apart. Lower your hips as if sitting back into a chair until thighs are parallel to the floor, then push up through heels.',
    },
    {
      name: 'Push-ups',
      description: 'Classic upper body exercise targeting chest, shoulders, and triceps.',
      category: 'Strength',
      muscleGroup: 'Chest',
      difficulty: 'Beginner',
      equipment: 'Bodyweight',
      instructions: 'Start in a high plank position with hands slightly wider than shoulders. Lower chest to near the floor while keeping body straight, then push up.',
    },
    {
      name: 'Brisk Walking',
      description: 'Low-impact cardiovascular exercise ideal for burning calories and boosting heart health.',
      category: 'Cardio',
      muscleGroup: 'Full Body',
      difficulty: 'Beginner',
      equipment: 'None',
      instructions: 'Walk at a steady, energetic pace where breathing is elevated but conversation is still possible.',
    },
    {
      name: 'Plank Hold',
      description: 'Isometric core stability exercise.',
      category: 'Strength',
      muscleGroup: 'Core',
      difficulty: 'Beginner',
      equipment: 'Bodyweight',
      instructions: 'Forearms on the ground, elbows under shoulders, legs straight behind you. Keep body in a rigid straight line from head to heels.',
    },
    {
      name: 'Jumping Jacks',
      description: 'Dynamic full-body warm-up and cardio exercise.',
      category: 'Cardio',
      muscleGroup: 'Full Body',
      difficulty: 'Beginner',
      equipment: 'None',
      instructions: 'Jump feet outward while bringing hands together overhead, then jump back to starting standing position.',
    }
  ];

  for (const ex of defaultExercises) {
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {},
      create: ex,
    });
  }

  // 3. Seed Default Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lifestyle.com' },
    update: {},
    create: {
      email: 'admin@lifestyle.com',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: Role.ADMIN,
      profile: {
        create: {
          age: 30,
          gender: 'MALE',
          goal: GoalType.IMPROVE_FITNESS,
          dietType: DietType.NON_VEGETARIAN,
          city: 'Mumbai',
        },
      },
      subscriptions: {
        create: {
          planId: premiumPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`Plans created: ${freePlan.name}, ${proPlan.name}, ${premiumPlan.name}`);
  console.log(`Admin created: ${adminUser.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
