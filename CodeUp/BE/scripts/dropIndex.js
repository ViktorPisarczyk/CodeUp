// This script will drop the problematic index on the conversations collection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function dropIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the conversations collection
    const db = mongoose.connection.db;
    const collection = db.collection('conversations');
    
    // List all indexes
    console.log('Listing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the participants index
    try {
      console.log('Dropping participants_1 index...');
      await collection.dropIndex('participants_1');
      console.log('Index dropped successfully');
    } catch (error) {
      console.error('Error dropping index:', error.message);
    }
    
    // List indexes again to confirm
    const updatedIndexes = await collection.indexes();
    console.log('Updated indexes:', updatedIndexes);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

dropIndex();
