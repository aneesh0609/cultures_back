import { Cart ,Product , User } from "../config/bind.js"; 


export const addToCart = async (req, res) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  try {
    if (!userId) return res.status(400).json({ success: false, message: "Please login again" });

 
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.productId",
      select : "name price images colors sizes stock" ,
      model: Product,
    });

    res.status(200).json({ success: true, message: "Item added to cart", cart: populatedCart });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const getCartItems = async(req,res) => {

  const userId = req.user.id ;

  try {
          if(!userId)
          {
            return res.status(400).json({success: false , message : "please login again"});
          }

          const cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: "items.productId", 
        select: "name price images sizes colors stock", 
        model : Product
      })

          if(!cart)
          {
            return res.status(200).json({success: true , cart : { items : [] } }) ;
          }

         return  res.status(200).json({success: true , cart })



  } catch (error) {
        console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }

}


export const updateCartQuantity = async (req, res) => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  try {

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.productId",
      select : "name price images colors sizes stock" ,
      model: Product,
    });

    res.status(200).json({ success: true, message: "Cart updated", cart: populatedCart });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const removeFromCart = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  try {

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    const populatedCart = await cart.populate({
      path: "items.productId",
      model: Product,
    });

    res.status(200).json({ success: true, message: "Item removed from cart", cart: populatedCart });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// // 🟢 Clear Cart
// export const clearCart = async (req, res) => {
//   const userId = req.user?.id;

//   try {
//     if (!userId) return res.status(400).json({ success: false, message: "Please login again" });

//     await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

//     res.status(200).json({ success: true, message: "Cart cleared", cart: { items: [] } });
//   } catch (error) {
//     console.error("Clear Cart Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };