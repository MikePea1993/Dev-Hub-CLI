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

async function createReactProject(projectPath) {
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectPath);

    const packageJson = {
      name: path.basename(projectPath),
      version: "1.0.0",
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "^5.0.1",
      },
      scripts: {
        start: "react-scripts start",
        build: "react-scripts build",
        test: "react-scripts test",
        eject: "react-scripts eject",
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version",
        ],
      },
    };

    // Create source directory and React files
    await fs.ensureDir(path.join(projectPath, "src"));
    await fs.ensureDir(path.join(projectPath, "public"));

    // Create App.js
    await fs.writeFile(
      path.join(projectPath, "src/App.js"),
      `import React from 'react';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to My React App</h1>
                <p>Edit <code>src/App.js</code> to start building your application.</p>
            </header>
        </div>
    );
}

export default App;`
    );

    // Create App.css
    await fs.writeFile(
      path.join(projectPath, "src/App.css"),
      `.App {
    text-align: center;
}

.App-header {
    background-color: #282c34;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
}

.App-header code {
    background-color: #1a1a1a;
    padding: 0.2em 0.4em;
    border-radius: 3px;
}`
    );

    // Create index.js
    await fs.writeFile(
      path.join(projectPath, "src/index.js"),
      `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);`
    );

    // Create index.css
    await fs.writeFile(
      path.join(projectPath, "src/index.css"),
      `body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
}`
    );

    // Create public/index.html
    await fs.writeFile(
      path.join(projectPath, "public/index.html"),
      `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React application created with DevHub" />
    <title>React App</title>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
</body>
</html>`
    );

    // Create public/robots.txt
    await fs.writeFile(
      path.join(projectPath, "public/robots.txt"),
      `User-agent: *
Disallow:`
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(projectPath, ".gitignore"),
      `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*`
    );

    // Create README.md
    await fs.writeFile(
      path.join(projectPath, "README.md"),
      `# React Application

This project was created with DevHub.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

### \`npm run eject\`

**Note: this is a one-way operation. Once you \`eject\`, you can't go back!**

If you need to customize the build tool and configuration choices, you can \`eject\` at any time.`
    );

    // Write package.json
    await fs.writeFile(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Install dependencies
    await runCommand("npm install", projectPath);
  } catch (error) {
    console.error("Error in createReactProject:", error);
    throw error;
  }
}

module.exports = { createReactProject };
