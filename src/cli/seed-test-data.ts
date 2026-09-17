import { PrismaClient, MealType, ExpenseCategory, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestDataCLI() {
  console.log('🧪 Seeding test dataset...');

  // 1. Get or create a demo user
  let user = await prisma.user.findFirst({
    where: { email: 'test@lifestyle.com' },
    include: { profile: true },
  });

  if (!user) {
    const freePlan = await prisma.plan.findFirst({ where: { isDefault: true } });
    user = await prisma.user.create({
      data: {
        email: 'test@lifestyle.com',
        passwordHash: '$2a$10$wK1Ff5.42W.oD9k7a2yJ2.Qp1bW/8Y4o7w9/g5.',
        name: 'Demo Test User',
        role: 'USER',
        profile: {
          create: {
            age: 28,
            gender: 'MALE',
            heightCm: 175,
            weightKg: 73,
            targetWeightKg: 68,
            goal: 'WEIGHT_LOSS',
            dietType: 'NON_VEGETARIAN',
            dailyBudget: 300,
            city: 'Mumbai',
          },
        },
        ...(freePlan
          ? {
              subscriptions: {
                create: {
                  planId: freePlan.id,
                  status: 'ACTIVE',
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
              },
            }
          : {}),
      },
      include: { profile: true },
    });
  }

  const userId = user.id;
  console.log(`Target User ID: ${userId} (${user.email})`);

  // 2. Insert Mock Meals
  await prisma.meal.createMany({
    data: [
      {
        userId,
        mealType: MealType.BREAKFAST,
        name: 'Oatmeal & Almond Milk',
        totalCalories: 340,
        totalProteinG: 12,
        totalCarbsG: 52,
        totalFatG: 6,
        loggedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        userId,
        mealType: MealType.LUNCH,
        name: 'Chicken Thali & 2 Rotis',
        totalCalories: 650,
        totalProteinG: 38,
        totalCarbsG: 65,
        totalFatG: 18,
        loggedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  // 3. Insert Mock Expenses
  await prisma.expense.createMany({
    data: [
      {
        userId,
        category: ExpenseCategory.BREAKFAST,
        foodName: 'Oatmeal & Almond Milk',
        amount: 60,
        loggedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        userId,
        category: ExpenseCategory.LUNCH,
        foodName: 'Chicken Thali',
        amount: 120,
        restaurantName: 'Taste of Punjab',
        loggedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
  });

  // 4. Insert Mock Activity Logs
  await prisma.activity.createMany({
    data: [
      {
        userId,
        activityType: ActivityType.WALKING,
        durationMinutes: 30,
        steps: 4200,
        caloriesBurned: 160,
      },
      {
        userId,
        activityType: ActivityType.WORKOUT,
        durationMinutes: 25,
        steps: 2200,
        caloriesBurned: 180,
      },
    ],
  });

  // 5. Insert Mock Water Logs
  await prisma.waterLog.createMany({
    data: [
      { userId, glassCount: 2, amountMl: 500, loggedDate: new Date() },
      { userId, glassCount: 2, amountMl: 500, loggedDate: new Date() },
    ],
  });

  // 6. Insert Mock Weight History
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  await prisma.weightLog.createMany({
    data: [
      { userId, weightKg: 75.0, loggedDate: daysAgo(21) },
      { userId, weightKg: 74.2, loggedDate: daysAgo(14) },
      { userId, weightKg: 73.5, loggedDate: daysAgo(7) },
      { userId, weightKg: 73.0, loggedDate: new Date() },
    ],
  });

  // 7. Insert AI Memory & Conversation
  await prisma.aIMemory.upsert({
    where: { userId_memoryKey: { userId, memoryKey: 'preferred_protein' } },
    update: { memoryValue: 'Chicken and eggs' },
    create: { userId, memoryKey: 'preferred_protein', memoryValue: 'Chicken and eggs', category: 'lifestyle' },
  });

  console.log('✅ Test dataset seeded successfully!');
}

seedTestDataCLI()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
