import express from 'express' ;
import { cancelOrder, createOrder, getOrderById, getOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';


const orderRoute = express.Router() ;


orderRoute.post('/create-order' , protect , createOrder) ;
orderRoute.get('/getorders' , protect , getOrders) ;
orderRoute.get('/getorderbyid/:id' , protect , getOrderById) ;
orderRoute.post('/cancel-order/:id' , protect , cancelOrder) ;

export default orderRoute ;