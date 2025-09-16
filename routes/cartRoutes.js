import express from 'express' ;
import { addToCart, getCartItems, removeFromCart, updateCartQuantity } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';


const cartRoute =  express.Router() ;

cartRoute.post('/addtocart' ,protect ,  addToCart) ;
cartRoute.get('/getcart' , protect ,  getCartItems) ;
cartRoute.put('/updatecart' , protect ,  updateCartQuantity) ;
cartRoute.delete('/removecart' , protect ,  removeFromCart) ;



export default cartRoute ;