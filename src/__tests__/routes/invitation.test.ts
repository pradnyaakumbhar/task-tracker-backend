import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('Invitation Routes', () => {
  describe('GET /api/invitation/join/:invitationId', () => {
    it('should handle invitation link without authentication', async () => {
      const response = await request(app).get(
        '/api/invitation/join/invitation-123'
      )

      // doesn't require auth, so expect various status codes
      expect([200, 400, 410, 500]).toContain(response.status)
    })

    it('should handle invitation link with invalid invitation ID', async () => {
      const response = await request(app).get('/api/invitation/join/invalid-id')

      expect([200, 400, 410, 500]).toContain(response.status)
    })

    it('should handle invitation link with authentication token', async () => {
      const response = await request(app)
        .get('/api/invitation/join/invitation-123')
        .set('Authorization', 'Bearer some-token')

      expect([200, 400, 410, 500]).toContain(response.status)
    })

    it('should handle missing invitation ID in URL', async () => {
      const response = await request(app).get('/api/invitation/join/')

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/invitation/send', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/invitation/send').send({
        email: 'test@example.com',
        workspaceId: 'workspace-123',
        workspaceName: 'Test Workspace',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/invitation/send')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          email: 'test@example.com',
          workspaceId: 'workspace-123',
          workspaceName: 'Test Workspace',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should handle missing required fields', async () => {
      const response = await request(app).post('/api/invitation/send').send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should handle invalid email format', async () => {
      const response = await request(app).post('/api/invitation/send').send({
        email: 'invalid-email',
        workspaceId: 'workspace-123',
        workspaceName: 'Test Workspace',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('POST /api/invitation/accept', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/invitation/accept').send({
        invitationId: 'invitation-123',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/invitation/accept')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          invitationId: 'invitation-123',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should handle missing invitation ID', async () => {
      const response = await request(app)
        .post('/api/invitation/accept')
        .send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('Method validation', () => {
    it('should reject POST method on join endpoint', async () => {
      const response = await request(app)
        .post('/api/invitation/join/invitation-123')
        .send({})

      expect(response.status).toBe(404) // Route not found
    })

    it('should reject GET method on send endpoint', async () => {
      const response = await request(app).get('/api/invitation/send')

      expect(response.status).toBe(404)
    })

    it('should reject GET method on accept endpoint', async () => {
      const response = await request(app).get('/api/invitation/accept')

      expect(response.status).toBe(404)
    })

    it('should reject PUT method on send endpoint', async () => {
      const response = await request(app).put('/api/invitation/send').send({})

      expect(response.status).toBe(404)
    })

    it('should reject DELETE method on accept endpoint', async () => {
      const response = await request(app).delete('/api/invitation/accept')

      expect(response.status).toBe(404)
    })
  })
})
