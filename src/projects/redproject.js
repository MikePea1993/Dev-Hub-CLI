const fs = require("fs-extra");
const path = require("path");

async function createRedMProject(projectPath) {
  try {
    // Ensure project directory exists
    await fs.ensureDir(projectPath);

    // Create basic directory structure
    await fs.ensureDir(path.join(projectPath, "client"));
    await fs.ensureDir(path.join(projectPath, "server"));
    await fs.ensureDir(path.join(projectPath, "config"));

    // Create fxmanifest.lua
    const fxmanifest = `fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'Your Name'
description 'A RedM Resource'
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

-- Add your client-side code here
-- Example: Adding RedM-specific native calls
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- Your RedM client code here
    end
end)`;

    // Create server.lua
    const serverLua = `-- Server-side logic
local Config = {}

AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    print('The resource ' .. resourceName .. ' has been started.')
end)

-- Add your server-side code here
-- Example: RedM-specific server events`;

    // Create config.lua
    const configLua = `Config = {}

-- Add your configuration options here
Config.Debug = false
Config.EnableSomething = true

-- RedM-specific configurations
Config.EnablePeriodFeatures = true -- Enable/disable period-accurate features`;

    // Create README.md
    const readme = `# ${path.basename(projectPath)}

## Description
A RedM resource designed for RedM servers.

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
- Period-accurate features
- Other settings

## Dependencies
- None

## License
This project is licensed under the MIT License.

## Notes
This is a RedM resource and will only work with RedM servers. It is not compatible with FiveM.`;

    // Write all files
    await fs.writeFile(path.join(projectPath, "fxmanifest.lua"), fxmanifest);
    await fs.writeFile(path.join(projectPath, "client/client.lua"), clientLua);
    await fs.writeFile(path.join(projectPath, "server/server.lua"), serverLua);
    await fs.writeFile(path.join(projectPath, "config/config.lua"), configLua);
    await fs.writeFile(path.join(projectPath, "README.md"), readme);
  } catch (error) {
    console.error("Error in createRedMProject:", error);
    throw error;
  }
}

module.exports = { createRedMProject };
