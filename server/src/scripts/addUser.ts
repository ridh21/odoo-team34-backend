import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDummyUser() {
  try {
    const plainPassword = 'ridham123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('Plain Password:', plainPassword);
    console.log('Hashed Password:', hashedPassword);

    const user = await prisma.users.create({
      data: {
        emailID: 'ridhampatel2k4@gmail.com',
        mobileNumber: '8849155025',
        password: hashedPassword,
        state: 'Gujarat',
        city: 'Ahmedabad',
        pincode: '382418',
        longitude: 23.1166,
        latitude: 72.5466,
      },
    });

    console.log('Dummy user created successfully:', user);
  } catch (error) {
    console.error('Error creating dummy user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyUser();