import express from 'express' 
import { createProduct, getAllProducts, updateProducts } from '../controllers/ProductController.js';


const productRoute = express.Router();


productRoute.post('/create-product' , createProduct) ;
productRoute.get('/getAll-products' , getAllProducts);
productRoute.put('/update-products' , updateProducts);

export default productRoute ;