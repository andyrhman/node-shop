import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const mySeeder = new PrismaClient();

export default mySeeder;