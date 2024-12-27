const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

async function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function createElectronProject(projectPath, options = {}) {
  try {
    // Ensure the project directory exists
    await fs.ensureDir(projectPath);

    const packageJson = {
      name: path.basename(projectPath),
      version: "1.0.0",
      description: "Electron application created with DevHub",
      main: "main.js",
      scripts: {
        start: "electron .",
        build: "electron-builder",
      },
      dependencies: {
        electron: "^27.0.0",
      },
      devDependencies: {
        "electron-builder": "^24.13.3",
      },
    };

    // Add auto-updater if selected
    if (options.build && options.build["auto-updater"]) {
      packageJson.dependencies["electron-updater"] = "^6.1.7";
      packageJson.build = {
        publish: {
          provider: "github",
          owner: "YourUsername", // User should configure these
          repo: "YourRepo", // User should configure these
        },
      };

      // Create auto-updater code
      const mainJsWithUpdater = `
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        ${options.window && options.window.frameless ? "frame: false," : ""}
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');

    // Check for updates
    autoUpdater.checkForUpdatesAndNotify();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Auto Updater events
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});`;

      await fs.writeFile(path.join(projectPath, "main.js"), mainJsWithUpdater);
    } else {
      // Create standard main.js
      const mainJs = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        ${options.window && options.window.frameless ? "frame: false," : ""}
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});`;

      await fs.writeFile(path.join(projectPath, "main.js"), mainJs);
    }

    // Create index.html with optional custom titlebar
    let titlebarStyles = "";
    let titlebarHtml = "";

    if (options.window && options.window["custom-titlebar"]) {
      titlebarStyles = `
        <style>
            .titlebar {
                height: 32px;
                background: #333;
                color: white;
                -webkit-app-region: drag;
                display: flex;
                align-items: center;
                padding: 0 10px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
            }

            .titlebar-button {
                -webkit-app-region: no-drag;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 32px;
                height: 32px;
                cursor: pointer;
            }

            .titlebar-button:hover {
                background-color: rgba(255,255,255,0.1);
            }

            .content {
                margin-top: 32px;
                padding: 20px;
            }
        </style>`;

      titlebarHtml = `
        <div class="titlebar">
            <div style="flex-grow: 1;">My Electron App</div>
            <div class="titlebar-button" onclick="minimizeWindow()">-</div>
            <div class="titlebar-button" onclick="maximizeWindow()">□</div>
            <div class="titlebar-button" onclick="closeWindow()">×</div>
        </div>
        <script>
            const { ipcRenderer } = require('electron');
            
            function minimizeWindow() {
                ipcRenderer.send('minimize-window');
            }
            
            function maximizeWindow() {
                ipcRenderer.send('maximize-window');
            }
            
            function closeWindow() {
                ipcRenderer.send('close-window');
            }
        </script>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html>
    <head>
        <title>Electron App</title>
        ${titlebarStyles}
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                    sans-serif;
                margin: 0;
                padding: ${
                  options.window && options.window["custom-titlebar"]
                    ? "32px"
                    : "20px"
                } 20px 20px;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
            }

            h1 {
                color: #333;
            }
        </style>
    </head>
    <body>
${titlebarHtml}
        <div class="container">
            <h1>Welcome to Your Electron App</h1>
            <p>Start editing to create your application.</p>
        </div>
    </body>
</html>`;

    await fs.writeFile(path.join(projectPath, "index.html"), htmlContent);

    // Create README.md
    const readmeContent = `# Electron Application

This project was created with DevHub.

## Available Scripts

### \`npm start\`

Runs the app in development mode.

### \`npm run build\`

Builds the app for production.

${
  options.build && options.build["auto-updater"]
    ? `
## Auto Updates

This app includes auto-update functionality. To configure:

1. Update the \`build\` section in package.json with your GitHub repository details
2. Create a GitHub release to trigger updates
`
    : ""
}

${
  options.window && options.window["custom-titlebar"]
    ? `
## Custom Title Bar

This app includes a custom title bar. The window controls are fully functional.
`
    : ""
}`;

    await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);

    // Create package.json
    await fs.writeFile(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      `node_modules/
dist/
.DS_Store`
    );

    // Install dependencies
    await runCommand("npm install", projectPath);
  } catch (error) {
    console.error("Error in createElectronProject:", error);
    throw error;
  }
}

module.exports = { createElectronProject };