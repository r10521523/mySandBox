import { z } from "zod";
import pool from "./databasePool.js";
import { RowDataPacket } from "mysql2/promise";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import AppError from "../utils/appError.js";

const PorjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  user_id: z.number(),
  url: z.any(),
  container_id: z.any(),
  type: z.string(),
  status: z.string(),
  service_instance_id: z.number(),
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
  service_instance_id: number;
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

export const updateProjectAboutContainer = async (
  containerId: string,
  url: string,
  id: number
) => {
  const result = await pool.query(
    `
    UPDATE project
    SET container_id = ?, url = ?
    WHERE id = ?
    `,
    [containerId, url, id]
  );
  return result;
};

export const getProjectContainerId = async (id: number): Promise<string> => {
  const [results] = await pool.query<ProjectRow[]>(
    `
    SELECT container_id FROM project
    WHERE id = ?
    `,
    [id]
  );

  return results[0].container_id;
};

export const deleteProject = async (id: number) => {
  await pool.query(
    `
    DELETE FROM project
    WHERE id = ?
    `,
    [id]
  );
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

export const updateProjectServiceInstanceId = async (
  serviceInstanceId: number,
  id: number
) => {
  const result = await pool.query(
    `
    UPDATE project
    SET service_instance_id = ?
    WHERE id = ?
    `,
    [serviceInstanceId, id]
  );
  return result;
};
