import express from 'express' ;
import { getAllUsers, updateUser } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';



const userRoute = express.Router() ;


userRoute.get('/getusers' , protect , adminOnly , getAllUsers) ;
userRoute.put('/update' , protect , updateUser) ;


export default userRoute ;