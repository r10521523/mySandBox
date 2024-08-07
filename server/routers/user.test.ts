import express from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import router from './user.ts';
import * as userModel from '../models/user.ts';
import AppError from '../utils/appError.ts';
import globalErrorHandlerMiddleware from '../middlewares/errorHandler.ts';

const app = express();
app.use(express.json());
app.use('/api/user', router);
app.use(globalErrorHandlerMiddleware);

describe('GET /api/user?id', () => {
  beforeEach(() => {
    vi.spyOn(userModel, 'getUser').mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return user details when user is found', async () => {
    vi.spyOn(userModel, 'getUser').mockResolvedValueOnce({
      email: 'test@example.com',
      id: 1,
      name: 'Test',
      password: 'password',
      picture: null
    });

    const response = await request(app).get('/api/user?id=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: 'test@example.com',
      id: 1,
      name: 'Test',
      password: 'password',
      picture: null
    });
  });

  it('should return 404 when user is not found', async () => {
    vi.spyOn(userModel, 'getUser').mockImplementationOnce(() => {
      throw new AppError('User not found', 404);
    });

    const response = await request(app).get('/api/user?id=999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { statusCode: 404, message: 'User not found' }
    });
  });

  it('should return 500 when an unexpected error occurs', async () => {
    vi.spyOn(userModel, 'getUser').mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app).get('/api/user?id=2');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { statusCode: 500, message: 'Unexpected error' }
    });
  });
});
