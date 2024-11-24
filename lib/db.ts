import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connectToDB = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log('Already connected to DB');

    return;
  }

  if (connectionState === 2) {
    console.log('Connecting to DB...');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI!, {
      dbName: 'next14-mongodb-rest-apis',
      bufferCommands: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.log('Error: ', error);
    throw new Error('Error: ', error);
  }
};

export default connectToDB;
