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

async function createHtmlProject(projectPath, options = {}) {
  try {
    // Ensure the project directory exists
    await fs.ensureDir(projectPath);

    // Handle meta tags first
    let metaTags =
      '<meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">';

    if (options.meta) {
      if (options.meta.seo) {
        metaTags += `
    <meta name="description" content="Description of your site">
    <meta name="keywords" content="your, keywords">
    <meta name="author" content="Your Name">
    <meta name="robots" content="index, follow">`;
      }
      if (options.meta.social) {
        metaTags += `
    <meta property="og:title" content="Your Site Title">
    <meta property="og:description" content="Description of your site">
    <meta property="og:image" content="image.jpg">
    <meta property="og:url" content="your-site-url">
    <meta name="twitter:card" content="summary_large_image">`;
      }
    }

    let cssImports = "";
    let cssContent = "";
    let packageJson = null;
    let htmlContent = "";

    // Handle CSS framework selection
    if (options["css-framework"]) {
      if (options["css-framework"].tailwind) {
        // Create directories first
        await fs.ensureDir(path.join(projectPath, "src"));
        await fs.ensureDir(path.join(projectPath, "dist"));

        // Create package.json first
        packageJson = {
          name: path.basename(projectPath),
          version: "1.0.0",
          scripts: {
            dev: "tailwindcss -i ./src/styles.css -o ./dist/styles.css --watch",
            build:
              "tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify",
          },
          devDependencies: {
            tailwindcss: "^3.3.0",
          },
        };

        // Write package.json before running any npm commands
        await fs.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(packageJson, null, 2)
        );

        // Create tailwind config and styles
        const tailwindConfig = `
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}`;
        await fs.writeFile(
          path.join(projectPath, "tailwind.config.js"),
          tailwindConfig
        );
        await fs.writeFile(
          path.join(projectPath, "src/styles.css"),
          "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
        );

        // Install dependencies
        await runCommand("npm install", projectPath);

        // Create HTML template
        htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    ${metaTags}
    <title>My Website</title>
    <link href="./dist/styles.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <header class="bg-white shadow-lg">
        <nav class="container mx-auto px-6 py-4">
            <h1 class="text-3xl font-bold text-gray-800">Welcome to My Website</h1>
        </nav>
    </header>

    <main class="container mx-auto px-6 py-8">
        <section class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <p class="text-gray-600">Edit this template to start building your website!</p>
            <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Learn More
            </button>
        </section>
    </main>

    <footer class="bg-gray-800 text-white mt-12">
        <div class="container mx-auto px-6 py-4">
            <p class="text-center">&copy; ${new Date().getFullYear()} Your Name</p>
        </div>
    </footer>
    <script src="js/main.js"></script>
</body>
</html>`;

        // Initial Tailwind build
        await runCommand(
          "npx tailwindcss -i ./src/styles.css -o ./dist/styles.css",
          projectPath
        );
      } else if (options["css-framework"].bootstrap) {
        cssImports = `
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>`;
        cssContent = `
/* Custom styles */
body {
    padding-top: 60px;
}`;
      } else if (options["css-framework"].sass) {
        await fs.ensureDir(path.join(projectPath, "scss"));
        await fs.ensureDir(path.join(projectPath, "scss/components"));
        await fs.ensureDir(path.join(projectPath, "scss/layouts"));

        const scssContent = `
// Variables
$primary-color: #333;
$secondary-color: #666;
$accent-color: #aa3c53;
$font-stack: 'Segoe UI', Arial, sans-serif;

// Mixins
@mixin flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

// Base styles
body {
    margin: 0;
    padding: 20px;
    font-family: $font-stack;
    color: $primary-color;
}

// Import partials
@import 'components/buttons';
@import 'components/forms';
@import 'layouts/header';
@import 'layouts/footer';
`;

        const buttonStyles = `
.button {
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &--primary {
        background-color: $accent-color;
        color: white;
        
        &:hover {
            background-color: darken($accent-color, 10%);
        }
    }
}`;

        const formStyles = `
.form {
    &__group {
        margin-bottom: 1rem;
    }
    
    &__label {
        display: block;
        margin-bottom: 0.5rem;
    }
    
    &__input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid $secondary-color;
        border-radius: 4px;
    }
}`;

        const headerStyles = `
.header {
    @include flex-center;
    padding: 1rem;
    background-color: $primary-color;
    color: white;
}`;

        const footerStyles = `
.footer {
    padding: 1rem;
    background-color: $primary-color;
    color: white;
    text-align: center;
    margin-top: 2rem;
}`;

        await fs.writeFile(
          path.join(projectPath, "scss/main.scss"),
          scssContent
        );
        await fs.writeFile(
          path.join(projectPath, "scss/components/_buttons.scss"),
          buttonStyles
        );
        await fs.writeFile(
          path.join(projectPath, "scss/components/_forms.scss"),
          formStyles
        );
        await fs.writeFile(
          path.join(projectPath, "scss/layouts/_header.scss"),
          headerStyles
        );
        await fs.writeFile(
          path.join(projectPath, "scss/layouts/_footer.scss"),
          footerStyles
        );

        packageJson = {
          name: path.basename(projectPath),
          version: "1.0.0",
          scripts: {
            sass: "sass scss/main.scss css/styles.css --watch",
            "sass:build":
              "sass scss/main.scss css/styles.css --style compressed",
          },
          devDependencies: {
            sass: "^1.69.5",
          },
        };

        await fs.writeFile(
          path.join(projectPath, "package.json"),
          JSON.stringify(packageJson, null, 2)
        );
        await runCommand("npm install", projectPath);
        await runCommand("npm run sass:build", projectPath);

        const readmeContent = `# ${path.basename(projectPath)}

## SASS/SCSS Setup
1. Install dependencies:
    \`\`\`
    npm install
    \`\`\`

2. Watch SCSS changes:
    \`\`\`
    npm run sass
    \`\`\`

3. Build for production:
    \`\`\`
    npm run sass:build
    \`\`\`

## Project Structure
- scss/main.scss (main styles)
- scss/components/ (component styles)
    - _buttons.scss
    - _forms.scss
- scss/layouts/ (layout styles)
    - _header.scss
    - _footer.scss

## Using the Styles
- Use the predefined mixins and variables from main.scss
- Extend existing components or create new ones in the components directory
- Add new layout files in the layouts directory
`;
        await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
      } else {
        cssContent = `
/* Base styles */
body {
    margin: 0;
    padding: 20px;
    font-family: 'Segoe UI', Arial, sans-serif;
}

/* Layout */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

/* Components */
.button {
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

/* Utilities */
.text-center {
    text-align: center;
}`;
      }
    }

    // Create HTML file with selected options if not already created
    if (!htmlContent) {
      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    ${metaTags}
    <title>My Website</title>
    ${cssImports}
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>Welcome to My Website</h1>
        </div>
    </header>

    <main class="container">
        <section class="content">
            <p>Your content goes here...</p>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} Your Name</p>
        </div>
    </footer>
    <script src="js/main.js"></script>
</body>
</html>`;
    }

    // Handle CSS Reset
    if (options.reset) {
      const normalizeContent = `
/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */
html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}main{display:block}h1{font-size:2em;margin:.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:.35em .75em .625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}template{display:none}[hidden]{display:none}`;

      if (options.reset.normalize) {
        await fs.writeFile(
          path.join(projectPath, "css/normalize.css"),
          normalizeContent
        );
        cssImports = `<link rel="stylesheet" href="css/normalize.css">\n    ${cssImports}`;
      }
    }

    // Create basic directory structure
    if (!options["css-framework"]?.tailwind) {
      await fs.ensureDir(path.join(projectPath, "css"));
    }
    await fs.ensureDir(path.join(projectPath, "js"));
    await fs.ensureDir(path.join(projectPath, "images"));

    // Write files
    await fs.writeFile(path.join(projectPath, "index.html"), htmlContent);
    if (!options["css-framework"]?.tailwind) {
      await fs.writeFile(path.join(projectPath, "css/styles.css"), cssContent);
    }
    await fs.writeFile(
      path.join(projectPath, "js/main.js"),
      'console.log("Website loaded successfully!");'
    );
  } catch (error) {
    console.error("Error in createHtmlProject:", error);
    throw error;
  }
}

module.exports = { createHtmlProject };
