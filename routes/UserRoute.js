import express from 'express';
import { addTask, getMyProfile, login, logout, removeTask, signUp, updateTask, verify } from '../controller/UserControler.js';
import { isAuthenticated } from '../middleware/auth.js';


const router = express.Router();

router.post("/register", signUp);

router.post("/verify", isAuthenticated, verify)

router.post("/login", login)

router.get("/logout", logout)

router.post("/newtask", isAuthenticated, addTask)

router.get("/task/:taskId", isAuthenticated, updateTask)

router.delete("/task/:taskId", isAuthenticated, removeTask)

router.get("/me", isAuthenticated, getMyProfile);




export default router;