const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

// Mock User and Task models for rapid unit/integration testing
jest.mock('../src/models/User');
jest.mock('../src/models/Task');

describe('TaskFlow Backend API Test Suite', () => {
  const mockUserId1 = '664f8a123456789012345678';
  const mockUserId2 = '664f8a123456789012345679';
  const testSecret = 'test_secret_for_jwt_mocking_32_chars';
  let user1Token;
  let user2Token;

  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
    process.env.NODE_ENV = 'test';
    user1Token = jwt.sign({ id: mockUserId1 }, testSecret, { expiresIn: '1h' });
    user2Token = jwt.sign({ id: mockUserId2 }, testSecret, { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Health Check Endpoint (/api/health)', () => {
    it('GET /api/health should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('TaskFlow Backend API');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('2. Authentication API (/api/auth)', () => {
    it('POST /api/auth/register should validate invalid email and short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', email: 'invalid-email', password: '123' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/auth/register should register new user with hashed password and return token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: mockUserId1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        toSafeObject: () => ({
          id: mockUserId1,
          name: 'Jane Doe',
          email: 'jane@example.com',
        }),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@example.com');
    });

    it('POST /api/auth/register should reject duplicate email (409 Conflict)', async () => {
      User.findOne.mockResolvedValue({ _id: mockUserId1, email: 'jane@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('POST /api/auth/login should authenticate valid user', async () => {
      const mockUser = {
        _id: mockUserId1,
        email: 'jane@example.com',
        name: 'Jane Doe',
        comparePassword: jest.fn().mockResolvedValue(true),
        toSafeObject: () => ({ id: mockUserId1, name: 'Jane Doe', email: 'jane@example.com' }),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject invalid credentials (401)', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId1,
          name: 'Jane Doe',
          email: 'jane@example.com',
          toSafeObject: () => ({ id: mockUserId1, name: 'Jane Doe', email: 'jane@example.com' }),
        }),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
    });
  });

  describe('3. Task Management API (/api/tasks)', () => {
    beforeEach(() => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: mockUserId1,
          name: 'Jane Doe',
          email: 'jane@example.com',
        }),
      });
    });

    it('GET /api/tasks should return tasks and summary metrics', async () => {
      const mockTasks = [
        { _id: '664f8b111111111111111111', title: 'Task 1', status: 'To-Do', userId: mockUserId1 },
        { _id: '664f8b222222222222222222', title: 'Task 2', status: 'In-Progress', userId: mockUserId1 },
      ];

      Task.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTasks),
      });
      Task.countDocuments
        .mockResolvedValueOnce(2) // total
        .mockResolvedValueOnce(1) // todo
        .mockResolvedValueOnce(1) // inProgress
        .mockResolvedValueOnce(0); // done

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.summary.total).toBe(2);
    });

    it('POST /api/tasks should create a task associated with authenticated user', async () => {
      Task.create.mockResolvedValue({
        _id: '664f8b333333333333333333',
        title: 'Complete Assessment',
        description: 'Build full stack MERN app',
        status: 'To-Do',
        userId: mockUserId1,
      });

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Complete Assessment',
          description: 'Build full stack MERN app',
          status: 'To-Do',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Complete Assessment');
    });

    it('PUT /api/tasks/:id should update task details', async () => {
      const mockTask = {
        _id: '664f8b333333333333333333',
        title: 'Original Title',
        description: 'Original Desc',
        status: 'To-Do',
        userId: mockUserId1,
        save: jest.fn().mockResolvedValue(true),
      };

      Task.findOne.mockResolvedValue(mockTask);

      const res = await request(app)
        .put('/api/tasks/664f8b333333333333333333')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Desc',
          status: 'In-Progress',
        });

      expect(res.statusCode).toBe(200);
      expect(mockTask.title).toBe('Updated Title');
      expect(mockTask.status).toBe('In-Progress');
    });

    it('PATCH /api/tasks/:id/status should update task status', async () => {
      const mockTask = {
        _id: '664f8b333333333333333333',
        status: 'In-Progress',
        userId: mockUserId1,
        save: jest.fn().mockResolvedValue(true),
      };

      Task.findOne.mockResolvedValue(mockTask);

      const res = await request(app)
        .patch('/api/tasks/664f8b333333333333333333/status')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ status: 'Done' });

      expect(res.statusCode).toBe(200);
      expect(mockTask.status).toBe('Done');
    });

    it('DELETE /api/tasks/:id should delete task', async () => {
      Task.findOneAndDelete.mockResolvedValue({
        _id: '664f8b333333333333333333',
        userId: mockUserId1,
      });

      const res = await request(app)
        .delete('/api/tasks/664f8b333333333333333333')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('SECURITY: Accessing or modifying another user task should return 404', async () => {
      Task.findOne.mockResolvedValue(null); // User 2 cannot find User 1 task

      const res = await request(app)
        .get('/api/tasks/664f8b333333333333333333')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
