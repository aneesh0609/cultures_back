import express from 'express' ;
import { addToCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';


const cartRoute =  express.Router() ;

cartRoute.post('/addtocart' ,protect ,  addToCart) ;



export default cartRoute ;