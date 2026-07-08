/**
 * Seed orchestrator — runs one seed function per topic.
 * Run with: npm run seed
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { seedAlphabetTopic } from './topics/alphabet';
import { seedDuasTopic } from './topics/duas';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noor';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await seedAlphabetTopic();
    await seedDuasTopic();

    console.log('\n🌙 Noor database seeded successfully!\n');
  } catch (err) {
    console.error('❌ Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
