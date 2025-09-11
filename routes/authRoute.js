
import express from 'express'
import { signup } from '../controllers/AuthController.js';


const Route = express.Router() ;


Route.get('/register', signup) ;


export default Route ;