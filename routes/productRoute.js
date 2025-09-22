import express from 'express' 
import { createProduct, deleteProduct, getAllProducts, updateProducts } from '../controllers/ProductController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';


const productRoute = express.Router();


productRoute.post('/create-product' , protect , adminOnly , createProduct) ;
productRoute.get('/getAll-products' , protect,  getAllProducts);
productRoute.put('/update-products' , protect , adminOnly , updateProducts);
productRoute.delete('/delete-products' , protect , adminOnly , deleteProduct);

export default productRoute ;