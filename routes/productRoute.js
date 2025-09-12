import express from 'express' 
import { createProduct, getAllProducts } from '../controllers/ProductController.js';


const productRoute = express.Router();


productRoute.post('/create-product' , createProduct) ;
productRoute.get('/getAll-products' , getAllProducts);

export default productRoute ;