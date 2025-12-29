import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropUsernameIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        // Drop the username_1 index
        await collection.dropIndex('username_1');
        console.log('✅ Successfully dropped username_1 index');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

dropUsernameIndex();
