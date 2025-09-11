import mongoose from 'mongoose' 


const connectDb1 = async () => 
{

     mongoose.connection.on( 'connected'  ,() => {
        console.log("database 1 connected");
      })

    await mongoose.connect(process.env.MongoDb_URI);
   
}

export default connectDb1 ;
