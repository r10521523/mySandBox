# Code3Wich

[![build-passing](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/luhanwangdev/Code3Wich)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/luhanwangdev/Code3Wich)

![Code3Wich](./assets/animation.gif)

Website Link: [Code3Wich](https://code3wich.luhanwang.com/)

## Introduction

Code3Wich is an online IDE that allows users to deploy static websites and dynamic servers directly through the platform. It aims to leverage cross-platform capabilities to enable developers to work more easily and quickly anytime, anywhere.

## Tutorial

Currently, Code3Wich supports 2 project types:

- **_Vanilla JS_** for static website deployment.
- **_Node_** for server deployment.

### How to create a project

1. Sign in or sign up first.
2. Click the 'folder' icon in the navigator.
3. Enter project name (up to 10 characters).
4. Select project type (**_Vanilla JS_** or **_Node_**).
5. Click 'Create' button.

![Create Project](./assets/create_project.gif)

### How to edit existed project

1. Sign in or sign up first.
2. Click the 'folder' icon in the navigator.
3. Select the project you want to edit and click 'Edit' button.
4. Make changes in the code editor, then press Control + S or Command + S to save.
5. The changes will be immediately displayed in the live preview window.

![Edit Project](./assets/edit_project.gif)

### How to create new file/folder inside a project

1. Sign in or sign up first.
2. Click the 'folder' icon in the navigator.
3. Select the project you want to edit and click 'Edit' button.
4. Right-click in the SideBar and select 'New File' or 'New folder'.
5. Alternatively, you can use the **touch** command to create a file or the **mkdir** command to create a folder in the terminal.

![Create File](./assets/create_file.gif)

### How to delete existed file/folder inside a project

1. Sign in or sign up first.
2. Click the 'folder' icon in the navigator.
3. Select the project you want to edit and click 'Edit' button.
4. Hover over the file or folder you want to delete, right-click, and select 'Delete'.
5. Alternatively, you can use the **rm** command to delete a file or the **rm -rf** command to delete a folder in the terminal.

![Delete File](./assets/delete_file.gif)

### How to share the results of the project

1. Sign in or sign up first.
2. Share the url we provide!

- In the project list (inside the project box)

  <img src="./assets/project_url.png" width="400" />

- In the project editing page (inside the terminal area)

  <img src="./assets/terminal_url.png" width="700" />

## Motivation

Initially, I aimed to create a real-time compiler for Unity's web platform. However, I soon realized that Unity's system is too heavy and challenging to run efficiently on a lightweight web environment. Still driven by my original goal of working on game-related projects, I pivoted to focusing on Three.js, a library that can also be used for game development.

While exploring Three.js, I realized that if I wanted to compile and execute JavaScript code, I might as well create a project that supports a complete development environment. Thus, Code3Wich was born!

## Tech / Framwork used

- Docker
- Socket.IO
- AWS AmazonMQ (RabbitMQ)
- AWS RDS (MySQL)
- Vite + React
- TypeScript
- JavaScript

## Features

- **Static Web Hosting**: For projects using vanilla JavaScript, you can host and view your static web pages directly.

- **Dynamic Server Support**: For Node.js projects, you can host servers and interact with corresponding APIs to get return results.

- **Cross-Platform Compatibility**: Whether you're using a smartphone, iPad, or computer, you can compile code directly from our website.
- **Persistent and Shareable Projects**: Your compiled projects are preserved and can be accessed via a unique URL, allowing you to share your creations with friends and family.

- **Integrated Terminal Interface**:

  - Perform any operation through the terminal interface.
  - Download modules.
  - Create files and more through the terminal.

- **Real-Time Results Display**: Instantly see your web project results on the screen as you code.

## Architecture

![Architecture](./assets/architecture.drawio.png)

## Stress Test

In Code3wich, after reviewing all functionalities, the bottleneck seems to occur when creating a project, as it involves creating a container. Therefore, this project specifically focuses on conducting a stress test for the project creation scenario.

### Goals

- Confirm the maximum number of projects that can be created simultaneously and the required time for each EC2 instance type.
- Implement safeguards for the maximum number of simultaneous project creations on a t2.micro instance to prevent the server from crashing due to too many concurrent project creations.

### Test Tool

<a href="https://k6.io/docs/" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/e/ef/K6-logo.svg" style="width: 5rem;"></a>

### Result

![Stress test result](./assets/stress_test.png)

### Conclusion

If a AWS EC2 **t2.micro** instance is used as the service instance machine, it can handle the creation of only three projects simultaneously, whether the project type is Vanilla JS or Node. Otherwise, the machine will crash.

However, upgrading to an AWS EC2 **t3.micro** instance, which has one more CPU than **t2.micro** instance, will have limited impact on addressing bottlenecks, and the effect may be quite similar to AWS EC2 **t2.micro** instance.

On the other hand, using an AWS EC2 **t2.small** instance, which has twice the memory of **t2.micro** instance, results in a significant improvement. This clearly indicates that the bottleneck in creating the project lies in memory rather than CPU.

Finally, testing the AWS EC2 **t2.large** instance shows that both its CPU and memory are significantly better than those of **t2.micro** instance. It clearly demonstrates that **t2.large** instance has the best performance.

### Solution

Set up an AWS Amazon MQ (RabbitMQ Broker) queue specifically for handling project creation tasks, and simultaneously launch 3 workers as consumers for this queue to meet the requirement of processing 3 tasks concurrently.

## Support me

<a href="https://www.buymeacoffee.com/kaswang" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
