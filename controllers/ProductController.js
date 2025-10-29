import { Product } from "../config/bind.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
   

    if (!name || !description || !price || !category || !stock) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // ✅ Handle Cloudinary Upload
    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "cultures_products",
        });
        imageUrls.push(result.secure_url);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images: imageUrls,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};



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
    const { productId } = req.body;
    const { name, description, price, category, stock } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // 🔸 If a new image is uploaded, remove old one from Cloudinary
    if (req.file) {
      if (product.images?.length > 0) {
        const oldUrl = product.images[0];
        // extract public_id safely
        const parts = oldUrl.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        const folder = "cultures_app_uploads";
        await cloudinary.uploader.destroy(`${folder}/${filename}`);
      }

      // new image already uploaded via multer-storage-cloudinary
      const newImageUrl = req.file.path; // multer-storage-cloudinary stores URL in path
      product.images = [newImageUrl];
    }

    // 🔸 Update other fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
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

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // 🔸 Delete from Cloudinary
    if (product.images?.length > 0) {
      const oldUrl = product.images[0];
      const parts = oldUrl.split("/");
      const filename = parts[parts.length - 1].split(".")[0];
      const folder = "cultures_app_uploads";
      await cloudinary.uploader.destroy(`${folder}/${filename}`);
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product and associated image deleted successfully",
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};