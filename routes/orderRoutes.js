import express from 'express' ;
import { createOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';


const orderRoute = express.Router() ;


orderRoute.post('/create-order' , protect , createOrder) ;

export default orderRoute ;