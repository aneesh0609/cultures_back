
import express from 'express'
import { logout, signin, signup } from '../controllers/AuthController.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';


const Route = express.Router() ;


Route.post('/register',authLimiter, signup) ;
Route.post('/login',authLimiter ,signin);
Route.post('/logout' , logout );


export default Route ;