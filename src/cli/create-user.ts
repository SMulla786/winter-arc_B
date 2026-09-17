import { PrismaClient, Role, GoalType, DietType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUserCLI() {
  const args = process.argv.slice(2);
  
  // Parse simple CLI flags or positionals
  const emailArg = args.find((a) => a.startsWith('--email='))?.split('=')[1] || `user_${Date.now()}@lifestyle.com`;
  const passwordArg = args.find((a) => a.startsWith('--password='))?.split('=')[1] || 'Password@123';
  const nameArg = args.find((a) => a.startsWith('--name='))?.split('=')[1] || 'Test User';
  const roleArg = (args.find((a) => a.startsWith('--role='))?.split('=')[1]?.toUpperCase() || 'USER') as Role;
  const planArg = args.find((a) => a.startsWith('--plan='))?.split('=')[1] || 'Pro';

  console.log('🚀 Creating user via CLI...');
  console.log(`Email: ${emailArg}`);
  console.log(`Name: ${nameArg}`);
  console.log(`Role: ${roleArg}`);
  console.log(`Plan: ${planArg}`);

  const existing = await prisma.user.findUnique({ where: { email: emailArg } });
  if (existing) {
    console.error(`❌ User with email ${emailArg} already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(passwordArg, 10);
  const targetPlan = await prisma.plan.findFirst({ where: { name: { equals: planArg, mode: 'insensitive' } } });

  const user = await prisma.user.create({
    data: {
      email: emailArg,
      passwordHash,
      name: nameArg,
      role: roleArg,
      profile: {
        create: {
          age: 26,
          gender: 'MALE',
          heightCm: 178,
          weightKg: 74,
          targetWeightKg: 70,
          goal: GoalType.WEIGHT_LOSS,
          dietType: DietType.NON_VEGETARIAN,
          dailyBudget: 350,
          city: 'Mumbai',
          area: 'Bandra West',
        },
      },
      ...(targetPlan
        ? {
            subscriptions: {
              create: {
                planId: targetPlan.id,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      subscriptions: { include: { plan: true } },
    },
  });

  console.log('✅ User created successfully!');
  console.log(`ID: ${user.id}`);
  console.log(`Assigned Plan: ${user.subscriptions[0]?.plan.name || 'None'}`);
}

createUserCLI()
  .catch((e) => {
    console.error('❌ Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
