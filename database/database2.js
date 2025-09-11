import mongoose from 'mongoose' 


const connectDb2 =  () => 
{

     mongoose.connection.on( 'connected'  ,() => {
        console.log("database 2 connected");
      })

       mongoose.createConnection(process.env.MONGO_URI_2);
   
}

export default connectDb2 ;