import mongoose from "mongoose";

const connectDb = async () => 
{
  mongoose.connection.on(() => {
    console.log("Database connected")  ;
  })
   mongoose.connect(process.env.MongoDb_URI) ;
}

export default connectDb ;
