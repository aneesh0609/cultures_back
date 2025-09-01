import mongoose from "mongoose";

const connectDb = async () => 
{
  mongoose.connection.on(() => {
    console.log("Database connectedd 2")  ;
  })
   mongoose.connect(process.env.MongoDb_URI) ;
}

export default connectDb ;
