import express from 'express' ;
import {  cancelOrder, createOrder, getAllOrders, getOrderById, getOrders, getUserOrders } from '../controllers/orderController.js';
import {  adminOnly, protect } from '../middleware/authMiddleware.js';


const orderRoute = express.Router() ;


orderRoute.post('/create-order' , protect , createOrder) ;
orderRoute.get('/getorders' , protect , getOrders) ;
orderRoute.get('/getorderbyid/:id' , protect , getOrderById) ;
orderRoute.post('/cancel-order/:id' , protect , cancelOrder) ;


orderRoute.get("/all",protect,adminOnly ,  getAllOrders );

//  Get all orders of a specific user (Admin only)

orderRoute.get("/user/:id", protect, adminOnly, getUserOrders);

export default orderRoute ;