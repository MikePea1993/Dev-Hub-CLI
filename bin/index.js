#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");
const os = require("os");
const ora = require("ora");

// Add runCommand function
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

const { createHtmlProject } = require("../src/projects/htmlproject");
const { createReactProject } = require("../src/projects/reactproject");
const { createElectronProject } = require("../src/projects/electronproject");
const { createFiveMProject } = require("../src/projects/fiveproject");
const { createRedMProject } = require("../src/projects/redproject");

// ASCII Art Banner
console.log(
  chalk.blue(`
 /$$$$$$$                                          /$$   /$$           /$$            
| $$__  $$                                        | $$  | $$          | $$            
| $$  \  $$ /$$$$$$  /$$    /$$                    | $$  | $$ /$$   /$$| $$$$$$$       
| $$  | $$ /$$__  $$| $$  /$$/       /$$$$$$      | $$$$$$$$| $$  | $$| $$__  $$      
| $$  | $$| $$$$$$$$ \  $$/$$/       |______/      | $$__  $$| $$  | $$| $$  |  $$      
| $$  | $$| $$_____/  \  $$$/                      | $$  | $$| $$  | $$| $$  | $$      
| $$$$$$$/|  $$$$$$$   \  $/                       | $$  | $$|  $$$$$$/| $$$$$$$/      
|_______/  \_______/    \_/                         |__/  |__/  \______/ |_______/      
                          -- Frsk Development --
                                                                                 
`)
);

program
  .version("1.0.0")
  .description("CLI tool for creating development project boilerplates");

program
  .command("create")
  .description("Create a new project")
  .action(async () => {
    const questions = [
      {
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        validate: (input) => {
          if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
          return "Project name may only include letters, numbers, underscores and hashes.";
        },
      },
      {
        type: "list",
        name: "template",
        message: "What project template would you like to use?",
        choices: [
          { name: "HTML/CSS - Simple website", value: "html" },
          { name: "React - Modern web application", value: "react" },
          { name: "Electron - Desktop application", value: "electron" },
          { name: "FiveM - GTA V multiplayer resource", value: "fivem" },
          {
            name: "RedM - Red Dead Redemption 2 multiplayer resource",
            value: "redm",
          },
        ],
      },
    ];

    const { projectName, template } = await inquirer.prompt(questions);

    // Get advanced options based on template
    let advancedOptions = {};
    if (template === "html") {
      const htmlOptions = await inquirer.prompt([
        {
          type: "checkbox",
          name: "frameworks",
          message:
            "Select CSS frameworks: (Use ↑↓ to move, Space to select, Enter to confirm)",
          choices: [
            { name: "Pure CSS", value: "pure-css" },
            { name: "Tailwind CSS", value: "tailwind" },
            { name: "Bootstrap", value: "bootstrap" },
            { name: "Sass/SCSS", value: "sass" },
          ],
        },
        {
          type: "checkbox",
          name: "meta",
          message:
            "Select meta tags: (Use ↑↓ to move, Space to select, Enter to confirm)",
          choices: [
            { name: "SEO Optimization", value: "seo" },
            { name: "Social Media Tags", value: "social" },
          ],
        },
      ]);
      advancedOptions = {
        "css-framework": {
          "pure-css": htmlOptions.frameworks.includes("pure-css"),
          tailwind: htmlOptions.frameworks.includes("tailwind"),
          bootstrap: htmlOptions.frameworks.includes("bootstrap"),
          sass: htmlOptions.frameworks.includes("sass"),
        },
        meta: {
          seo: htmlOptions.meta.includes("seo"),
          social: htmlOptions.meta.includes("social"),
        },
      };
    } else if (template === "electron") {
      const electronOptions = await inquirer.prompt([
        {
          type: "checkbox",
          name: "features",
          message:
            "Select Electron features: (Use ↑↓ to move, Space to select, Enter to confirm)",
          choices: [
            { name: "Frameless Window", value: "frameless" },
            { name: "Custom Title Bar", value: "custom-titlebar" },
            { name: "Auto Updater", value: "auto-updater" },
            { name: "Custom Installer", value: "installer" },
          ],
        },
      ]);

      advancedOptions = {
        window: {
          frameless: electronOptions.features.includes("frameless"),
          "custom-titlebar":
            electronOptions.features.includes("custom-titlebar"),
        },
        build: {
          "auto-updater": electronOptions.features.includes("auto-updater"),
          installer: electronOptions.features.includes("installer"),
        },
      };
    }

    // Create project directory in Documents/DevHub like the desktop app
    const baseProjectPath = path.join(os.homedir(), "Documents", "DevHub");

    // Create DevHub directory if it doesn't exist
    if (!fs.existsSync(baseProjectPath)) {
      fs.mkdirSync(baseProjectPath, { recursive: true });
    }

    const projectPath = path.join(baseProjectPath, projectName);

    try {
      console.log(); // Add a blank line for spacing
      const spinner = ora("Creating project structure...").start();

      try {
        switch (template) {
          case "html":
            spinner.text = "Creating HTML project structure...";
            await createHtmlProject(projectPath, advancedOptions);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
            // Open VS Code
            spinner.start("Opening project in VS Code...");
            try {
              await exec(`code "${projectPath}"`);
              spinner.succeed("Project opened in VS Code");
            } catch (error) {
              spinner.warn("VS Code could not be opened automatically");
            }
            break;

          case "react":
            spinner.text = "Creating React project structure...";
            await createReactProject(projectPath);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
            // Open VS Code
            spinner.start("Opening project in VS Code...");
            try {
              await exec(`code "${projectPath}"`);
              spinner.succeed("Project opened in VS Code");
            } catch (error) {
              spinner.warn("VS Code could not be opened automatically");
            }
            break;

          case "electron":
            spinner.text = "Creating Electron project structure...";
            await createElectronProject(projectPath, advancedOptions);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
            // Open VS Code
            spinner.start("Opening project in VS Code...");
            try {
              await exec(`code "${projectPath}"`);
              spinner.succeed("Project opened in VS Code");
            } catch (error) {
              spinner.warn("VS Code could not be opened automatically");
            }
            break;

          case "fivem":
            spinner.text = "Creating FiveM resource structure...";
            await createFiveMProject(projectPath);
            spinner.succeed("FiveM resource created successfully!");
            console.log(chalk.blue("\nResource created at:"));
            console.log(chalk.white(`  ${projectPath}`));
            break;

          case "redm":
            spinner.text = "Creating RedM resource structure...";
            await createRedMProject(projectPath);
            spinner.succeed("RedM resource created successfully!");
            console.log(chalk.blue("\nResource created at:"));
            console.log(chalk.white(`  ${projectPath}`));
            break;
        }

        // Only show next steps for npm projects
        if (["html", "react", "electron"].includes(template)) {
          console.log(chalk.blue("\nNext step:"));
          console.log(chalk.white("  Run `npm start` to launch your project"));
        }
      } catch (error) {
        spinner.fail("Error creating project");
        throw error;
      }
    } catch (error) {
      console.error(chalk.red("\nError details:"), error);
      process.exit(1);
    }
  });

program.parse(process.argv);
