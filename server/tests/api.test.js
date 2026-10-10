const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_super_secret_jwt_key_1234567890';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('TaskFlow Backend API');
  });
});

describe('2. Authentication API (/api/auth)', () => {
  const testUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
  };

  it('POST /api/auth/register should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.name).toBe(testUser.name);
    expect(res.body.data.user.password).toBeUndefined(); // Ensure password is not exposed
    expect(res.body.data.token).toBeDefined();

    // Verify password is hashed in database
    const dbUser = await User.findOne({ email: testUser.email }).select('+password');
    expect(dbUser.password).not.toBe(testUser.password);
    expect(dbUser.password.startsWith('$2')).toBe(true);
  });

  it('POST /api/auth/register should reject duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/auth/register should reject invalid email format and short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/auth/login should authenticate valid user and return token', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login should reject incorrect password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('GET /api/auth/me should return authenticated user profile', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('GET /api/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('3. Task Management API (/api/tasks)', () => {
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123',
    });
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password123',
    });
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  it('POST /api/tasks should create a new task for the authenticated user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Design Kanban UI',
        description: 'Create responsive Kanban board layout with Tailwind/CSS',
        status: 'To-Do',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Design Kanban UI');
    expect(res.body.data.status).toBe('To-Do');
    expect(res.body.data.userId.toString()).toBe(user1Id.toString());
  });

  it('GET /api/tasks should return only tasks belonging to the authenticated user', async () => {
    // User 1 creates 2 tasks
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task 1 for User 1', status: 'To-Do' });
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task 2 for User 1', status: 'In-Progress' });

    // User 2 creates 1 task
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Task 1 for User 2', status: 'Done' });

    // Fetch for User 1
    const resUser1 = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(resUser1.statusCode).toBe(200);
    expect(resUser1.body.data.length).toBe(2);
    expect(resUser1.body.summary.total).toBe(2);
    expect(resUser1.body.summary.todo).toBe(1);
    expect(resUser1.body.summary.inProgress).toBe(1);

    // Fetch for User 2
    const resUser2 = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(resUser2.statusCode).toBe(200);
    expect(resUser2.body.data.length).toBe(1);
    expect(resUser2.body.summary.total).toBe(1);
    expect(resUser2.body.summary.done).toBe(1);
  });

  it('PUT /api/tasks/:id should update task details', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Original Title', description: 'Original Desc', status: 'To-Do' });

    const taskId = createRes.body.data._id || createRes.body.data.id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Updated Title',
        description: 'Updated Desc',
        status: 'In-Progress',
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.title).toBe('Updated Title');
    expect(updateRes.body.data.status).toBe('In-Progress');
  });

  it('PATCH /api/tasks/:id/status should update only task status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Status Test Task', status: 'To-Do' });

    const taskId = createRes.body.data._id || createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ status: 'Done' });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.data.status).toBe('Done');
  });

  it('PATCH /api/tasks/:id/status should reject invalid status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Status Test Task', status: 'To-Do' });

    const taskId = createRes.body.data._id || createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ status: 'InvalidStatus' });

    expect(patchRes.statusCode).toBe(422);
  });

  it('DELETE /api/tasks/:id should delete task owned by user', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Task to Delete', status: 'To-Do' });

    const taskId = createRes.body.data._id || createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(deleteRes.statusCode).toBe(200);

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(getRes.statusCode).toBe(404);
  });

  it('SECURITY: User 2 should NOT be able to read, update, or delete User 1 task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Private User 1 Task', status: 'To-Do' });

    const taskId = createRes.body.data._id || createRes.body.data.id;

    // User 2 attempts GET
    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(getRes.statusCode).toBe(404);

    // User 2 attempts PUT
    const putRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Hacked Title' });
    expect(putRes.statusCode).toBe(404);

    // User 2 attempts PATCH status
    const patchRes = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ status: 'Done' });
    expect(patchRes.statusCode).toBe(404);

    // User 2 attempts DELETE
    const delRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(delRes.statusCode).toBe(404);
  });
});
