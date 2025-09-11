import mongoose from "mongoose";

const connectDb = async () => 
{
<<<<<<< HEAD
  mongoose.connection.on('connected' ,() => {
    console.log("Database connectedd")  ;
=======
  mongoose.connection.on(() => {
    console.log("Database connected")  ;
>>>>>>> 99d4d267fbdc3e5e31a6f5491bc99dffdcca3ceb
  })
  await mongoose.connect(process.env.MongoDb_URI) ;
}

export default connectDb ;
