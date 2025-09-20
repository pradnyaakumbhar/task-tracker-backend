import request from 'supertest'
import express from 'express'
import routes from '../../routes/index'

const app = express()
app.use(express.json())
app.use('/api', routes)

describe('Task Routes', () => {
  describe('POST /api/task/create', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).post('/api/task/create').send({
        title: 'Test Task',
        spaceId: 'space-123',
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/create')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Test Task',
          spaceId: 'space-123',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should handle missing required fields', async () => {
      const response = await request(app).post('/api/task/create').send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })

  describe('POST /api/task/details', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/task/details')
        .send({ taskId: 'task-123' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/details')
        .set('Authorization', 'Bearer invalid-token')
        .send({ taskId: 'task-123' })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('PUT /api/task/update/:taskId', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .put('/api/task/update/task-123')
        .send({
          title: 'Updated Task',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .put('/api/task/update/task-123')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          title: 'Updated Task',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('DELETE /api/task/delete/:taskId', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).delete('/api/task/delete/task-123')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .delete('/api/task/delete/task-123')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/task/analytics', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/task/analytics')
        .send({ workspaceId: 'workspace-123' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/analytics')
        .set('Authorization', 'Bearer invalid-token')
        .send({ workspaceId: 'workspace-123' })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/task/versions', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/task/versions')
        .send({ taskId: 'task-123' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/versions')
        .set('Authorization', 'Bearer invalid-token')
        .send({ taskId: 'task-123' })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/task/versionDetails', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/task/versionDetails')
        .send({
          taskId: 'task-123',
          version: '1',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/versionDetails')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          taskId: 'task-123',
          version: '1',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/task/version/revert', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/task/version/revert')
        .send({
          taskId: 'task-123',
          version: '1',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 403 when invalid token is provided', async () => {
      const response = await request(app)
        .post('/api/task/version/revert')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          taskId: 'task-123',
          version: '1',
        })

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })
  })

  describe('Method validation', () => {
    it('should return 401 for GET method on create endpoint', async () => {
      const response = await request(app).get('/api/task/create')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for GET method on details endpoint', async () => {
      const response = await request(app).get('/api/task/details')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for POST method on delete endpoint', async () => {
      const response = await request(app)
        .post('/api/task/delete/task-123')
        .send({})

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for GET method on update endpoint', async () => {
      const response = await request(app).get('/api/task/update/task-123')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })
  })
})
