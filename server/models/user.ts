import { z } from 'zod';
import { RowDataPacket } from 'mysql2';
import pool from './databasePool.js';
import instanceOfSetHeader from '../utils/instanceOfSetHeader.js';
import AppError from '../utils/appError.js';

const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().max(20),
  email: z.string().email(),
  password: z.string(),
  picture: z.any()
});

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  picture: any;
}

export const getUser = async (id: number) => {
  const results = await pool.query(
    `
      SELECT * FROM user
      WHERE id = ?
      `,
    [id]
  );

  const user = z.array(UserSchema).parse(results[0]);

  if (user[0]) {
    return user[0];
  }

  throw new AppError('User not found', 404);
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const results = await pool.query(
    `
      INSERT INTO user(name, email, password)
      VALUES (?, ?, ?)
      `,
    [name, email, password]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return { id: results[0].insertId, name, email };
  }

  throw new AppError('create user failed', 400);
};

export const checkUserByEmail = async (email: string) => {
  const results = await pool.query(
    `
      SELECT * FROM user
      WHERE email = ?
      `,
    [email]
  );
  const user = z.array(UserSchema).parse(results[0]);
  return user[0];
};

export const getUserPasswordByEmail = async (
  email: string
): Promise<string> => {
  const [results] = await pool.query<UserRow[]>(
    `
      SELECT password FROM user
      WHERE email = ?
      `,
    [email]
  );

  if (results[0]) {
    return results[0].password;
  }

  throw new AppError('User not found', 404);
};
