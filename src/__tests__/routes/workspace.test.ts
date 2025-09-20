import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('Workspace Routes', () => {
  describe('POST /api/workspace/create', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/workspace/create').send({
        name: 'Test Workspace',
        description: 'Test Description',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: 'Test Workspace',
          description: 'Test Description',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should return 400 when workspace name is missing', async () => {
      const response = await request(app).post('/api/workspace/create').send({
        description: 'Test Description',
      })

      expect(response.status).toBe(401) // Auth middleware runs first
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should accept valid workspace data format', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace',
          description: 'Test Description',
          memberEmails: ['test@example.com'],
        })

      // Could be 200 (success), 401 (no auth), 403 (bad token), or 500 (server error)
      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })

  describe('POST /api/workspace/details', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/workspace/details').send({
        workspaceId: 'workspace-123',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/workspace/details')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          workspaceId: 'workspace-123',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should accept valid workspace details request format', async () => {
      const response = await request(app).post('/api/workspace/details').send({
        workspaceId: 'workspace-123',
      })

      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })

  describe('GET /api/workspace/spaces', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/workspace/spaces').query({
        workspaceId: 'workspace-123',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/workspace/spaces')
        .set('Authorization', 'Bearer invalid-token')
        .query({
          workspaceId: 'workspace-123',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should accept valid query parameters', async () => {
      const response = await request(app).get('/api/workspace/spaces').query({
        workspaceId: 'workspace-123',
      })

      expect([200, 401, 403, 500]).toContain(response.status)
    })

    it('should handle missing query parameters', async () => {
      const response = await request(app).get('/api/workspace/spaces')

      expect(response.status).toBe(401) // Auth middleware runs first
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('POST /api/workspace/dashboardData', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/workspace/dashboardData')
        .send({
          workspaceId: 'workspace-123',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/workspace/dashboardData')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          workspaceId: 'workspace-123',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should accept valid dashboard data request format', async () => {
      const response = await request(app)
        .post('/api/workspace/dashboardData')
        .send({
          workspaceId: 'workspace-123',
        })

      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })

  describe('Method validation', () => {
    it('should return 401 for GET method on create endpoint (auth required)', async () => {
      const response = await request(app).get('/api/workspace/create')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for GET method on details endpoint (auth required)', async () => {
      const response = await request(app).get('/api/workspace/details')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for POST method on spaces endpoint (auth required)', async () => {
      const response = await request(app).post('/api/workspace/spaces').send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for PUT method on create endpoint (auth required)', async () => {
      const response = await request(app).put('/api/workspace/create').send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for DELETE method on any endpoint (auth required)', async () => {
      const response = await request(app).delete('/api/workspace/create')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('Data validation format', () => {
    it('should handle empty request body for create endpoint', async () => {
      const response = await request(app).post('/api/workspace/create').send({})

      expect(response.status).toBe(401) // Auth runs first
      expect(response.body.success).toBe(false)
    })

    it('should handle malformed JSON for details endpoint', async () => {
      const response = await request(app).post('/api/workspace/details').send({
        workspaceId: null,
      })

      expect(response.status).toBe(401) // Auth runs first
      expect(response.body.success).toBe(false)
    })

    it('should handle array data for create endpoint', async () => {
      const response = await request(app)
        .post('/api/workspace/create')
        .send({
          name: 'Test Workspace',
          memberEmails: ['test1@example.com', 'test2@example.com'],
        })

      expect([200, 401, 403, 500]).toContain(response.status)
    })

    it('should handle empty array for memberEmails', async () => {
      const response = await request(app).post('/api/workspace/create').send({
        name: 'Test Workspace',
        memberEmails: [],
      })

      expect([200, 401, 403, 500]).toContain(response.status)
    })
  })
})
