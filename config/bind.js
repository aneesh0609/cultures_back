import connectDb1 from "../database/database.js";
import connectDb2 from "../database/database2.js";
import userSchema from "./userSchema.js";
import productSchema from "./productSchema.js";

let User , Product ;

const initModels = async () => {
  const db1 = await connectDb1(); // main mongoose connection
  const db2 = await connectDb2(); // secondary connection

  // ✅ Attach schema to DB1 only
  User = db1.model("User", userSchema);
  Product = db1.model("Product", productSchema);

  return { db1, db2, User , Product };
};

export { initModels, User , Product};
