const fs = require("fs-extra");
const path = require("path");

async function createFiveMProject(projectPath) {
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectPath);

    // Create basic directory structure
    await fs.ensureDir(path.join(projectPath, "client"));
    await fs.ensureDir(path.join(projectPath, "server"));
    await fs.ensureDir(path.join(projectPath, "config"));

    // Create fxmanifest.lua
    const fxmanifest = `fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'A FiveM Resource'
version '1.0.0'

client_scripts {
    'config/config.lua',
    'client/*.lua'
}

server_scripts {
    'config/config.lua',
    'server/*.lua'
}`;

    // Create client.lua
    const clientLua = `-- Client-side logic
local Config = {}

RegisterNetEvent('onResourceStart')
AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    print('The resource ' .. resourceName .. ' has been started.')
end)

-- Add your client-side code here`;

    // Create server.lua
    const serverLua = `-- Server-side logic
local Config = {}

AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    print('The resource ' .. resourceName .. ' has been started.')
end)

-- Add your server-side code here`;

    // Create config.lua
    const configLua = `Config = {}

-- Add your configuration options here
Config.Debug = false
Config.EnableSomething = true`;

    // Create README.md
    const readme = `# ${path.basename(projectPath)}

## Description
A FiveM resource.

## Features
- Feature 1
- Feature 2

## Installation
1. Download the resource
2. Place it in your resources folder
3. Add \`ensure ${path.basename(projectPath)}\` to your server.cfg

## Configuration
Edit the config.lua file to modify:
- Debug mode
- Other settings

## Dependencies
- None

## License
This project is licensed under the MIT License.`;

    // Write all files
    await fs.writeFile(path.join(projectPath, "fxmanifest.lua"), fxmanifest);
    await fs.writeFile(path.join(projectPath, "client/client.lua"), clientLua);
    await fs.writeFile(path.join(projectPath, "server/server.lua"), serverLua);
    await fs.writeFile(path.join(projectPath, "config/config.lua"), configLua);
    await fs.writeFile(path.join(projectPath, "README.md"), readme);
  } catch (error) {
    console.error("Error in createFiveMProject:", error);
    throw error;
  }
}

module.exports = { createFiveMProject };
