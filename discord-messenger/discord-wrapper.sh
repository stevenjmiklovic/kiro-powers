#!/bin/bash
# This script invokes the discord-mcp server using the built index.js file.
# Prerequisites:
#   - Node.js 16.x or higher must be installed
#   - discord-mcp must be cloned and built at ~/discordmcp
#   - Run: git clone https://github.com/v-3/discordmcp.git ~/discordmcp
#   - Run: cd ~/discordmcp && npm install && npm run build

# Use DISCORD_TOKEN from environment (passed via mcp.json)
exec node /Users/stevenm/v3-x.net/discordmcp/build/index.js
