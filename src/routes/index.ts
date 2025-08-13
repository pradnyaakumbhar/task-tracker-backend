import express, {Request, Response} from "express";
import authRoutes from './authRoutes';

const router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

export default router;