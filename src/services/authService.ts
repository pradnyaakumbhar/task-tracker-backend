import jwt from 'jsonwebtoken';
import userDao from '../dao/userDao';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const authService = {
    verifyToken : (token: string): any => {
        return jwt.verify(token, JWT_SECRET);
    },

    registerUser : async (name: string, email: string, password: string): Promise<AuthResult> => {
        // Check if user already exists
        const existingUser = await userDao.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await userDao.createUser({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = generateToken(user.id, user.email);

        return {
            token,
            user: {
            id: user.id,
            name: user.name,
            email: user.email
            }
        };
    },

    loginUser : async (email: string, password: string): Promise<AuthResult> => {
        // Check if user already exists
        const user = await userDao.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // chek if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        
        // Generate JWT token
        const token = generateToken(user.id, user.email);

        return {
            token,
            user: {
            id: user.id,
            name: user.name,
            email: user.email
            }
        };
    }

}

export default authService;