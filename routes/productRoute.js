import express from 'express' 
import { createProduct, deleteProduct, getAllProducts, getSingleProduct, updateProducts } from '../controllers/ProductController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';


const productRoute = express.Router();


productRoute.post('/create-product' , protect , adminOnly , upload.array("images", 5), createProduct) ;
productRoute.get('/getAll-products' ,   getAllProducts);
productRoute.get("/:id", getSingleProduct);
productRoute.put('/update-products' , protect , adminOnly,upload.single("images") , updateProducts);
productRoute.delete('/delete-products' , protect , adminOnly , deleteProduct);

export default productRoute ;