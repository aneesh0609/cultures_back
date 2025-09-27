import express from 'express' ;
import { deleteUser, getAllUsers, getCurrentUser, updateUser } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';



const userRoute = express.Router() ;


userRoute.get('/getusers' , protect , adminOnly , getAllUsers) ;
userRoute.get('/me', protect, getCurrentUser);
userRoute.put('/update' , protect , updateUser) ;
userRoute.delete('/delete' , protect , deleteUser) ;


export default userRoute ;