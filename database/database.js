import mongoose from "mongoose";

const connectDb = async () => 
{
  mongoose.connection.on('connected' ,() => {
    console.log("Database connectedd")  ;
  })
  await mongoose.connect(process.env.MongoDb_URI) ;
}

export default connectDb ;