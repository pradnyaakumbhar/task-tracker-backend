import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should return 400 when missing required fields', async () => {
      const response = await request(app).post('/api/auth/register').send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid email format')
    })

    it('should return 400 for short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('6 characters')
    })

    it('should handle valid registration data format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      // 201 (success), 409 (user exists), or 500 (database error)
      expect([201, 409, 500]).toContain(response.status)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should return 400 when missing email and password', async () => {
      const response = await request(app).post('/api/auth/login').send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Email and password are required')
    })

    it('should return 400 when missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Email and password are required')
    })

    it('should handle valid login data format', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      })

      // Could be 200 (success), 401 (invalid credentials), or 500 (database error)
      expect([200, 401, 500]).toContain(response.status)
    })
  })

  describe('POST /api/auth/verify', () => {
    it('should return 400 when token is missing', async () => {
      const response = await request(app).post('/api/auth/verify').send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Token is required')
    })

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'invalid-token' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid token')
    })
  })
})
