import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('Space Routes', () => {
  describe('POST /api/space/create', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/space/create').send({
        workspaceId: 'workspace-123',
        name: 'Test Space',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/space/create')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          workspaceId: 'workspace-123',
          name: 'Test Space',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should handle missing required fields', async () => {
      const response = await request(app).post('/api/space/create').send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('POST /api/space/tasks', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/space/tasks')
        .send({ spaceId: 'space-123' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/space/tasks')
        .set('Authorization', 'Bearer invalid-token')
        .send({ spaceId: 'space-123' })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/space/delete/:id', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).delete('/api/space/delete/space-123')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .delete('/api/space/delete/space-123')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/space/update', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).put('/api/space/update').send({
        id: 'space-123',
        name: 'Updated Name',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .put('/api/space/update')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          id: 'space-123',
          name: 'Updated Name',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Method validation', () => {
    it('should reject GET method on create endpoint', async () => {
      const response = await request(app).get('/api/space/create')

      expect(response.status).toBe(404) // Route not found
    })

    it('should reject POST method on delete endpoint', async () => {
      const response = await request(app)
        .post('/api/space/delete/space-123')
        .send({})

      expect(response.status).toBe(404)
    })

    it('should reject GET method on update endpoint', async () => {
      const response = await request(app).get('/api/space/update')

      expect(response.status).toBe(404)
    })
  })
})
