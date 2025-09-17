import express from 'express' ;
import { createOrder, getOrderById, getOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';


const orderRoute = express.Router() ;


orderRoute.post('/create-order' , protect , createOrder) ;
orderRoute.get('/getorders' , protect , getOrders) ;
orderRoute.get('/getorderbyid/:id' , protect , getOrderById) ;

export default orderRoute ;