
import express from 'express'
import { logout, signin, signup } from '../controllers/AuthController.js';


const Route = express.Router() ;


Route.get('/register', signup) ;
Route.post('/login', signin);
Route.post('/logout' , logout );


export default Route ;