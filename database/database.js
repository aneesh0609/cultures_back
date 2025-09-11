import mongoose from 'mongoose';

const connectDb1 = async () => {
  const conn = await mongoose.connect(process.env.MongoDb_URI);
  console.log("✅ Database 1 connected");
  return conn.connection; // return the connection
};

export default connectDb1;
