import express from 'express' ;
import { addToCart, getCartItems, updateCartQuantity } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';


const cartRoute =  express.Router() ;

cartRoute.post('/addtocart' ,protect ,  addToCart) ;
cartRoute.get('/getcart' , protect ,  getCartItems) ;
cartRoute.put('/updatecart' , protect ,  updateCartQuantity) ;



export default cartRoute ;