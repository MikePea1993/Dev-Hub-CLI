#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");
const os = require("os");
const ora = require("ora");
const https = require("https");
const semver = require("semver");
const packageJson = require("../package.json");

async function checkForUpdates() {
  return new Promise((resolve) => {
    https
      .get(
        "https://registry.npmjs.org/dev-hub-cli/latest",
        { headers: { "User-Agent": "node" } },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              const latestVersion = JSON.parse(data).version;
              const currentVersion = packageJson.version;

              if (semver.gt(latestVersion, currentVersion)) {
                console.log(
                  chalk.yellow("\n┌────────────────────────────────────────┐")
                );
                console.log(
                  chalk.yellow("│           Update Available!            │")
                );
                console.log(
                  chalk.yellow("└────────────────────────────────────────┘")
                );
                console.log(chalk.white(`Current version: ${currentVersion}`));
                console.log(chalk.green(`Latest version: ${latestVersion}`));
                console.log(
                  chalk.blue("\nRun the following command to update:")
                );
                console.log(chalk.white("npm install -g dev-hub-cli@latest\n"));
              } else {
                console.log(
                  chalk.green("\n✓ CLI is up to date ") +
                    chalk.gray(`(version ${currentVersion})`)
                );
              }
              resolve();
            } catch (error) {
              resolve();
            }
          });
        }
      )
      .on("error", () => {
        resolve();
      });
  });
}
//runCommand function
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
const { createVueProject } = require("../src/projects/vueproject");

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
  .version(packageJson.version)
  .description("CLI tool for creating development project boilerplates");

program
  .command("create")
  .description("Create a new project")
  .action(async () => {
    // Checking for updates before showing prompts
    await checkForUpdates();

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
          { name: "Vue.js - Progressive JavaScript Framework", value: "vue" },
        ],
      },
    ];

    const { projectName, template } = await inquirer.prompt(questions);

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
    } else if (template === "vue") {
      const vueOptions = await inquirer.prompt([
        {
          type: "checkbox",
          name: "features",
          message: "Select Vue.js features:",
          choices: [
            { name: "TypeScript", value: "typescript" },
            { name: "Vue Router", value: "router" },
            { name: "Pinia State Management", value: "pinia" },
            { name: "Unit Testing", value: "testing" },
          ],
        },
      ]);

      // Convert array of features to object format
      advancedOptions = {
        features: vueOptions.features.reduce((acc, feature) => {
          acc[feature] = true;
          return acc;
        }, {}),
      };
    }

    // Create project in current directory
    const projectPath = path.join(process.cwd(), projectName);

    try {
      console.log();
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
            break;

          case "react":
            spinner.text = "Creating React project structure...";
            await createReactProject(projectPath);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
            break;

          case "electron":
            spinner.text = "Creating Electron project structure...";
            await createElectronProject(projectPath, advancedOptions);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
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

          case "vue":
            spinner.text = "Creating Vue.js project structure...";
            await createVueProject(projectPath, advancedOptions);
            spinner.succeed("Project structure created");
            spinner.start("Installing dependencies...");
            await runCommand("npm install", projectPath);
            spinner.succeed("Dependencies installed");
            break;
        }

        if (["html", "react", "electron", "vue"].includes(template)) {
          console.log(chalk.blue("\nNext steps:"));
          console.log(chalk.white(`  1. cd ${projectName}`));
          console.log(chalk.white("  2. npm run dev"));
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
