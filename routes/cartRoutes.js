import express from 'express' ;
import { addToCart, clearCart, getCartItems, removeFromCart, updateCartQuantity } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';


const cartRoute =  express.Router() ;

cartRoute.post('/addtocart' ,protect ,  addToCart) ;
cartRoute.get('/getcart' , protect ,  getCartItems) ;
cartRoute.put('/updatecart' , protect ,  updateCartQuantity) ;
cartRoute.delete('/removecart' , protect ,  removeFromCart) ;
cartRoute.put('/clearcart' , protect ,  clearCart) ;



export default cartRoute ;