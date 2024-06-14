import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import SideBar from "./SideBar.jsx";
import TabNavigation from "./TabNavigator";
import Header from "./Header.jsx";
import Terminal from "./Terminal.jsx";

const CodeEditor = () => {
  const { id } = useParams();
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [activeFile, setActiveFile] = useState({});
  const [files, setFiles] = useState([]);
  const [project, serProject] = useState({});

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const saveFile = async () => {
    const { name, type, project_id, parentId } = activeFile;
    await fetch(`http://localhost:3000/api/file/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
        projectId: project_id,
        parentId,
        code: value,
      }),
    });
  };

  const fetchFiles = async () => {
    const filesResponse = await fetch(
      `http://localhost:3000/api/file/project?projectId=${id}`
    );
    const files = await filesResponse.json();

    setFiles(files);
    setActiveFile(files[0]);
  };

  const fetchCode = async () => {
    const codeResponse = await fetch(
      `http://localhost:3000/api/file/edit?id=${activeFile.id}`
    );
    const code = await codeResponse.json();
    setValue(code.code);
  };

  const fetchProject = async () => {
    const projectResponse = await fetch(
      `http://localhost:3000/api/project?id=${id}`
    );
    const project = await projectResponse.json();
    serProject(project);
  };

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, []);

  useEffect(() => {
    console.log(activeFile);
    if (activeFile.id !== undefined) {
      fetchCode();
    }
  }, [activeFile]);

  return (
    <Box minH="100vh" bg="#2C2C32" color="gray.500" px={6} py={8}>
      <Header />
      <Flex>
        <Box flex="1">
          <SideBar
            files={files}
            setFiles={setFiles}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            projectId={id}
          />
        </Box>
        <Box flex="6">
          <TabNavigation
            files={files.filter((file) => !file.isFolder)}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
          />
          <Editor
            height="70vh"
            theme="vs-dark"
            language={activeFile.type}
            value={value}
            onChange={(value) => setValue(value)}
            onMount={onMount}
            options={{
              fontSize: 20,
            }}
          />
          <Terminal project={project} />
          <Flex alignItems="center">
            <Button mt="0.5rem" onClick={() => saveFile()}>
              Save
            </Button>

            {/* <Button mt="0.5rem" ml="2rem" bg="orange">
              <Link href={url} color="white" isExternal>
                {url}
              </Link>
            </Button> */}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default CodeEditor;
