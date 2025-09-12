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