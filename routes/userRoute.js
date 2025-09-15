import express from 'express' ;
import { getAllUsers } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';



const userRoute = express.Router() ;


userRoute.get('/getusers' , protect , adminOnly , getAllUsers) ;


export default userRoute ;