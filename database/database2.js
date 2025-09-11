import mongoose from 'mongoose' 


const connectDb2 = async () => 
{

     mongoose.connection.on( 'connected'  ,() => {
        console.log("database 2 connected");
      })

      await mongoose.connect(process.env.MONGO_URI_2);
   
}

export default connectDb2 ;