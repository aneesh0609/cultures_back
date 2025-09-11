import mongoose from 'mongoose';

const connectDb2 = async () => {
  const conn = await mongoose.createConnection(process.env.MONGO_URI_2);
  console.log("✅ Database 2 connected");
  return conn; // return the connection
};

export default connectDb2;
