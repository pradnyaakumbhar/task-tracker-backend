import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('User Routes', () => {
  describe('GET /api/user/profile', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/user/profile')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when malformed authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'InvalidFormat')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('GET /api/user/workspaces', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/user/workspaces')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/user/workspaces')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when empty authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/user/workspaces')
        .set('Authorization', '')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('Method validation', () => {
    it('should reject POST method on profile endpoint', async () => {
      const response = await request(app).post('/api/user/profile').send({})

      expect([404, 405]).toContain(response.status)
    })

    it('should reject POST method on workspaces endpoint', async () => {
      const response = await request(app).post('/api/user/workspaces').send({})

      expect([404, 405]).toContain(response.status)
    })

    it('should reject PUT method on profile endpoint', async () => {
      const response = await request(app).put('/api/user/profile').send({})

      expect([404, 405]).toContain(response.status)
    })
  })
})
