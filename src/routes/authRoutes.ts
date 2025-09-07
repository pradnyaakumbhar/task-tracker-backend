import express from 'express'
import authController from '../controllers/authController'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/registerWithInvitation', authController.registerWithInvitation)
export default router
