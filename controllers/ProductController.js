import { Product } from "../config/bind.js";



export const createProduct = async (req,res) => {
 
     
  const{name , description , price , category , stock , images } = req.body ;

  try {

     if(!name || !description || !price || !category || !stock || !images) {
    return res.status(400).json({success: false , message: "All fields Required"});
  }
    

    const product =  new Product({name,description,price,category,stock,images}) ;

    await product.save() ;
    
    res.status(200).json({success: true , message : "Product Successfully Created"})

  } catch (error) {
    
    return res.status(500).json({success: false , message : "PR Internal Server Error"})
  }

}


export const getAllProducts = async (req,res) => 
{
      try {
        
      const product = await Product.find() ;
      return res.status(200).json({success: true , product})

      } catch (error) {
           return res.status(500).json({success: false , message : "GP Internal Server Error"}) ;
      }
  
}




export const updateProducts = async (req, res) => {

  try {
    const { productId, updates } = req.body;

    if (!productId || !updates) {
      return res.status(400).json({ success: false, message: "Product ID and updates are required" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, updatedProduct });

  } catch (error) {
    console.error("Update failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct  = async (req,res) => 
{
    const {productId} = req.body ;

   try {

        if(!productId )
        {
          return res.status(400).json({success: false , message : "product id not received"})
        }

        const deletePr = await Product.findByIdAndDelete(productId);

        if(!deletePr)
        {
          return res.json({success: false , message : "product not found"}) ;
        }

        res.status(200).json({success: true , message: "product deleted successfully"});
    
   } catch (error) {
    console.error("delete failed:", error);
    return res.status(500).json({ success: false, message: error.message });
   }
}