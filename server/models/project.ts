import { z } from 'zod';
import pool from './databasePool.js';
import { RowDataPacket } from 'mysql2/promise';
import instanceOfSetHeader from '../utils/instanceOfSetHeader.js';
import AppError from '../utils/appError.js';

const PorjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  user_id: z.number(),
  url: z.any(),
  container_id: z.any(),
  type: z.string(),
  status: z.string(),
  service_instance_id: z.any(),
});

interface ProjectRow extends RowDataPacket {
  id: number;
  name: string;
  location: string;
  user_id: number;
  url: any;
  container_id: any;
  type: string;
  status: string;
  service_instance_id: any;
}

export const getProject = async (id: number) => {
  const results = await pool.query(
    `
    SELECT * FROM project
    WHERE id = ?
    `,
    [id]
  );

  const project = z.array(PorjectSchema).parse(results[0]);
  return project[0];
};

export const createProject = async (
  name: string,
  userId: number,
  type: string
) => {
  const results = await pool.query(
    `
    INSERT INTO project(name, user_id, type)
    VALUES (?, ?, ?)
    `,
    [name, userId, type]
  );

  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    const id = results[0].insertId;
    const location = `codeFiles/project${id}`;

    await pool.query(
      `
      UPDATE project
      SET location = ?
      WHERE id = ?
      `,
      [location, id]
    );

    return { id, name, location, user_id: userId };
  }

  throw new AppError('create file failed', 400);
};

export const getProjectsByUserId = async (userId: number) => {
  const results = await pool.query(
    `
    SELECT * FROM project
    WHERE user_id = ?
    `,
    [userId]
  );

  const projects = results
    .slice(0, -1)
    .map((result) => z.array(PorjectSchema).parse(result));

  return projects[0];
};

export const updateProjectStatus = async (status: string, id: number) => {
  const result = await pool.query(
    `
    UPDATE project
    SET status = ?
    WHERE id = ?
    `,
    [status, id]
  );
  return result;
};

export const getProjectServiceInstance = async (
  id: number
): Promise<number> => {
  const results = await pool.query<ProjectRow[]>(
    `
    SELECT service_instance_id FROM project
    WHERE id = ?
    `,
    [id]
  );

  return results[0][0].service_instance_id;
};
