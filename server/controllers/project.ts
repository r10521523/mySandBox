import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import * as projectModel from "../models/project.js";
import * as fileModel from "../models/file.js";
import AppError from "../utils/appError.js";
import { setUpContainer, execContainer } from "../utils/container.js";

export const getProject = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const project = await projectModel.getProject(id);

  res.status(200).send(project);
};

export const connectProjectTerminal = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const io = req.app.get("socketio");
  const userSocketMap = req.app.get("userSocketMap");
  const userSocketId = userSocketMap[`project${id}`];
  const userSocket = io.sockets.sockets.get(userSocketId);

  console.log(`project${id}: ${userSocketId}`);

  if (!userSocket) {
    throw new AppError("User socket not found", 500);
  }

  const containerId = await projectModel.getProjectContainerId(id);
  execContainer(userSocket, containerId);
};

export const createProject = async (req: Request, res: Response) => {
  const { name, userId, isDynamic } = req.body as unknown as {
    name: string;
    userId: number;
    isDynamic: boolean;
  };

  const project = await projectModel.createProject(name, userId, isDynamic);
  const projectPath = `codeFiles/project${project.id}`;
  const serverCode = `
  const http = require('http');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Docker World!');
  });

  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
  `;

  if (isDynamic) {
    createFile("index.js", "javascript", project.id, serverCode);
  } else {
    createFile("index.html", "html", project.id, "");
    createFile("style.css", "css", project.id, "");
    createFile("index.js", "javascript", project.id, "");
  }

  const watcher = chokidar.watch(projectPath, { persistent: true });

  watcher.on("add", (filePath: string) => {
    addFile(filePath, project.id);
  });

  watcher.on("addDir", (dirPath: string) => {
    addDir(dirPath, project.id);
  });

  watcher.on("unlink", (filePath) => {
    fileModel.deleteFileByPath(filePath);
  });

  watcher.on("error", (error: Error) => {
    throw new AppError(`Watcher error: ${error}`, 500);
  });

  const { containerId, containerUrl } = await setUpContainer(
    project.id,
    isDynamic
  );
  await projectModel.updateProjectAboutContainer(
    containerId,
    containerUrl,
    project.id
  );

  res
    .status(200)
    .json({ status: true, projectId: project.id, url: containerUrl });
};

export const getAllProjects = async (req: Request, res: Response) => {
  const projects = await projectModel.getAllProjects();

  res.status(200).send(projects);
};

export const getProjectsByUserId = async (req: Request, res: Response) => {
  const { id } = req.query as unknown as { id: number };

  const projects = await projectModel.getProjectsByUserId(id);

  res.status(200).send(projects);
};

const createFile = async (
  name: string,
  type: string,
  projectId: number,
  code: string
) => {
  const file = await fileModel.getFileByFileNameandProjectId(name, projectId);
  const filePath = `codeFiles/project${projectId}/${name}`;

  if (!file) {
    fileModel.createFile(name, type, filePath, projectId, false, 0);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      throw new AppError(err.message, 500);
    }
  });
};

const addFile = async (filePath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const fileName = path.basename(filePath);

  if (fileName !== "index.js") {
    const parentPath = path.dirname(filePath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      fileModel.createFile(fileName, "json", filePath, projectId, false, 0);
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);
      // console.log(`${fileName}: location ${filePath}`);
      fileModel.createFile(
        fileName,
        "json",
        filePath,
        projectId,
        false,
        parentFolder.id
      );
    }
  }
};

const addDir = async (dirPath: string, projectId: number) => {
  const projectPath = `codeFiles/project${projectId}`;
  const dirName = path.basename(dirPath);

  if (dirName !== `project${projectId}`) {
    const parentPath = path.dirname(dirPath);
    const fullPath = path.join(projectPath);
    if (parentPath === fullPath) {
      fileModel.createFile(dirName, "folder", dirPath, projectId, true, 0);
    } else {
      const parentFolder = await fileModel.getFileByPath(parentPath);
      fileModel.createFile(
        dirName,
        "folder",
        dirPath,
        projectId,
        true,
        parentFolder.id
      );
    }
  }
};
