import { PrismaClient } from "@prisma/client"
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function contactSeeder() {
  await prisma.contact.create({
    data: {
      first_name: 'test',
      last_name: 'test',
      email: 'test@example.com',
      phone: '1234',
      username: 'test',
    }
  });

  console.log('seeding ...');
    
}
