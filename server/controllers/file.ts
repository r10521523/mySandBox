import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import AppError from "../utils/appError.js";
import * as fileModel from "../models/file.js";

export const getSingleFile = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const file = await fileModel.getFile(id);

  res.status(200).send(file);
};

export const getFilesByProject = async (req: Request, res: Response) => {
  const { projectId } = req.query as unknown as { projectId: number };

  const files = await fileModel.getFilesByProjectId(projectId);

  res.status(200).send(files);
};

export const updateFile = async (req: Request, res: Response) => {
  const { name, type, projectId, parentId, code } = req.body as unknown as {
    name: string;
    type: string;
    projectId: number;
    parentId: number;
    code: string;
  };

  const file = await fileModel.getFileByFileNameandProjectId(name, projectId);

  let filePath;

  if (!file) {
    let isFolder = false;
    if (type === "folder") {
      isFolder = true;
    }

    if (parentId === 0) {
      filePath = `codeFiles/project${projectId}/${name}`;
    } else {
      const parentPath = await fileModel.getFilePath(parentId);
      filePath = `${parentPath}/${name}`;
    }

    fileModel.createFile(name, type, filePath, projectId, isFolder, parentId);

    if (isFolder) {
      fs.mkdirSync(filePath, { recursive: true });
      res.status(200).json({ success: true, path: filePath });
      return;
    }
  } else {
    filePath = file.location;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });

  res.status(200).json({ success: true, path: filePath, code });
};

export const loadFile = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as {
    id: number;
  };

  const filePath = await fileModel.getFilePath(id);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
    res.status(200).json({ status: true, code: data });
  });
};
