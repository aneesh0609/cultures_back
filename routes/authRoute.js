
import express from 'express'
import { signin, signup } from '../controllers/AuthController.js';


const Route = express.Router() ;


Route.get('/register', signup) ;
Route.post('/login', signin);


export default Route ;