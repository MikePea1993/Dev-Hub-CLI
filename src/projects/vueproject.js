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

async function createVueProject(projectPath, options = {}) {
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectPath);

    const packageJson = {
      name: path.basename(projectPath),
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        vue: "^3.3.4",
      },
      devDependencies: {
        "@vitejs/plugin-vue": "^4.3.4",
        vite: "^4.4.9",
      },
    };

    // Add TypeScript if selected
    if (options.features?.typescript) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        typescript: "^5.0.2",
        "@types/node": "^18.14.2",
        "vue-tsc": "^1.8.5",
      };
      packageJson.scripts.build = "vue-tsc && vite build";
    }

    // Add Router if selected
    if (options.features?.router) {
      packageJson.dependencies["vue-router"] = "^4.2.4";
    }

    // Add Pinia if selected
    if (options.features?.pinia) {
      packageJson.dependencies["pinia"] = "^2.1.6";
    }

    // Add Testing if selected
    if (options.features?.testing) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        vitest: "^0.34.4",
        "@vue/test-utils": "^2.4.1",
        jsdom: "^22.1.0",
      };
      packageJson.scripts.test = "vitest";
    }

    // Create project structure
    const directories = [
      "src",
      "src/assets",
      "src/components",
      options.features?.router && "src/views",
      options.features?.router && "src/router",
      options.features?.pinia && "src/stores",
      "public",
    ].filter(Boolean);

    // Create all directories
    for (const dir of directories) {
      await fs.ensureDir(path.join(projectPath, dir));
    }

    // Create vite.config.js/ts
    const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
${
  options.features?.typescript
    ? "import { fileURLToPath, URL } from 'node:url'"
    : ""
}

export default defineConfig({
  plugins: [vue()]${
    options.features?.typescript
      ? `,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }`
      : ""
  }
})`;

    // Determine file extensions based on TypeScript selection
    const ext = options.features?.typescript ? "ts" : "js";

    // Create main file
    const mainContent = `import { createApp } from 'vue'
${options.features?.router ? "import router from './router'" : ""}
${options.features?.pinia ? "import { createPinia } from 'pinia'" : ""}
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
${options.features?.pinia ? "app.use(createPinia())" : ""}
${options.features?.router ? "app.use(router)" : ""}

app.mount('#app')`;

    // Create App.vue
    const appContent = `<template>
  <div id="app">
    ${
      options.features?.router
        ? `<nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>`
        : "<h1>Welcome to Your Vue.js App</h1>"
    }
  </div>
</template>

<script ${options.features?.typescript ? 'lang="ts" ' : ""}setup>
${options.features?.typescript ? "import { defineComponent } from 'vue'" : ""}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  padding: 0 10px;
}

nav a.router-link-active {
  color: #42b983;
}
</style>`;

    // Create HelloWorld component
    const helloWorldContent = `<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script ${options.features?.typescript ? 'lang="ts" ' : ""}setup>
defineProps<{ msg: string }>()
</script>

<style scoped>
.hello {
  margin: 20px;
}

h1 {
  color: #42b983;
}
</style>`;

    // Write core files
    await fs.writeFile(
      path.join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
    await fs.writeFile(
      path.join(projectPath, `vite.config.${ext}`),
      viteConfig
    );
    await fs.writeFile(path.join(projectPath, `src/main.${ext}`), mainContent);
    await fs.writeFile(path.join(projectPath, "src/App.vue"), appContent);
    await fs.writeFile(
      path.join(projectPath, "src/components/HelloWorld.vue"),
      helloWorldContent
    );

    // Create router if selected
    if (options.features?.router) {
      const routerContent = `import { ${
        options.features?.typescript ? "RouteRecordRaw, " : ""
      }createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes${options.features?.typescript ? ": RouteRecordRaw[]" : ""} = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router`;

      await fs.writeFile(
        path.join(projectPath, `src/router/index.${ext}`),
        routerContent
      );

      // Create view components
      const homeViewContent = `<template>
  <div class="home">
    <HelloWorld msg="Welcome to Your Vue.js ${
      options.features?.typescript ? "+ TypeScript " : ""
    }App"/>
  </div>
</template>

<script ${options.features?.typescript ? 'lang="ts" ' : ""}setup>
import HelloWorld from '../components/HelloWorld.vue'
</script>`;

      const aboutViewContent = `<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script ${options.features?.typescript ? 'lang="ts" ' : ""}setup>
</script>`;

      await fs.writeFile(
        path.join(projectPath, "src/views/HomeView.vue"),
        homeViewContent
      );
      await fs.writeFile(
        path.join(projectPath, "src/views/AboutView.vue"),
        aboutViewContent
      );
    }

    // Create TypeScript files if selected
    if (options.features?.typescript) {
      const tsConfig = {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          module: "ESNext",
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "preserve",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
        include: ["env.d.ts", "src/**/*", "src/**/*.vue"],
        exclude: ["src/**/__tests__/*"],
      };

      await fs.writeFile(
        path.join(projectPath, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2)
      );
      await fs.writeFile(
        path.join(projectPath, "env.d.ts"),
        `/// <reference types="vite/client" />\n`
      );
    }

    // Create base CSS
    const mainCss = `@import './base.css';

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}

a {
  text-decoration: none;
  color: #42b983;
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: #42b98320;
  }
}`;

    const baseCss = `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  position: relative;
}

body {
  min-height: 100vh;
  color: #2c3e50;
  background: #ffffff;
  line-height: 1.6;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

    // Create index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>`;

    await fs.writeFile(path.join(projectPath, "src/assets/main.css"), mainCss);
    await fs.writeFile(path.join(projectPath, "src/assets/base.css"), baseCss);
    await fs.writeFile(path.join(projectPath, "index.html"), indexHtml);

    // Create .gitignore
    const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local

/cypress/videos/
/cypress/screenshots/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`;

    await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore);
  } catch (error) {
    console.error("Error in createVueProject:", error);
    throw error;
  }
}

module.exports = { createVueProject };
