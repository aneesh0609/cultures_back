import connectDb1 from "../database/database.js";
import connectDb2 from "../database/database2.js";
import userSchema from "./userSchema.js";
import productSchema from "./productSchema.js";
import cartSchema from "./cartSchema.js";
import orderSchema from "./orderSchema.js";

let User , Product , Cart , Order;

const initModels = async () => {
  const db1 = await connectDb1(); // main mongoose connection
  const db2 = await connectDb2(); // secondary connection

  // ✅ Attach schema to DB1 only
  User = db1.model("User", userSchema);
  Product = db1.model("Product", productSchema);
  Cart = db2.model('Cart' , cartSchema);
  Order = db2.model('Order' , orderSchema);

  return { db1, db2, User , Product , Cart , Order};
};

export { initModels, User , Product , Cart , Order};
