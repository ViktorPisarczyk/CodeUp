import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Conversation } from '../models/conversationModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function resetConversations() {
  try {
    // Drop the conversations collection
    console.log('Dropping conversations collection...');
    await mongoose.connection.db.dropCollection('conversations');
    console.log('Conversations collection dropped successfully');
  } catch (error) {
    if (error.code === 26) {
      console.log('Collection does not exist, nothing to drop');
    } else {
      console.error('Error dropping collection:', error);
    }
  }

  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
}

resetConversations();
