import { PrismaClient } from "@prisma/client"
import * as bcrypt from 'bcrypt';
// import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export async function userSeeder() {
  await prisma.user.create({
    data: {
      username: 'test',
      password: await bcrypt.hash('test', 10),
      name: 'test',
      token: 'test'
    }
  });

  console.log('seeding ...');
    
}
