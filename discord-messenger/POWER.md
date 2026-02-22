---
name: "discord-messenger"
displayName: "Discord Messenger"
description: "Send and Read messages in Discord channels through your bot - simple two-way communication for notifications and monitoring"
keywords: ["discord", "messaging", "channels", "notifications", "communication", "bots"]
author: "Steven J Miklovic"
---

# Onboarding

Complete these steps before using this power.

## Step 1: Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and click **New Application**
2. Name your application and click **Create**
3. Navigate to **Bot** → **Add Bot** → confirm
4. Click **Reset Token** to generate a Bot Token
5. Copy the **Bot Token**

**SECURITY WARNING**: Never commit your Bot Token to source control. Store in environment variables or secrets manager. Regenerate immediately if exposed.

6. Configure permissions:
   - Navigate to **OAuth2** → **URL Generator**
   - Select scopes: `bot`
   - Select permissions: `View Channels`, `Send Messages`, `Read Message History`
   - Copy the generated URL and invite bot to your server

**Required Bot Permissions** (minimum):
- `View Channels` — Read channel structure
- `Send Messages` — Post messages
- `Read Message History` — Retrieve past messages

## Step 2: Install and Build discord-mcp

The Discord power uses the `discord-mcp` server which must be installed and built before use.

**Prerequisites:**
- Node.js 16.x or higher

**Installation Steps:**

1. Clone the discord-mcp repository:
   ```bash
   git clone https://github.com/v-3/discordmcp.git ~/discordmcp
   ```

2. Navigate to the directory:
   ```bash
   cd ~/discordmcp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

**Note:** Update the `discord-wrapper.sh` script if you install discord-mcp in a different location.

## Step 3: Configure the Bot Token

Add your Discord Bot Token to the MCP configuration:

1. Open `mcp.json` in your workspace
2. Set the `DISCORD_TOKEN` environment variable to your Bot Token from Step 1
3. Save and restart Kiro to connect

Example configuration:
```json
{
  "mcpServers": {
    "discord": {
      "command": "sh",
      "args": ["discord-wrapper.sh"],
      "env": {
        "DISCORD_TOKEN": "your_bot_token_here"
      }
    }
  }
}
```

# Overview

Simple Discord integration for sending and reading messages through your bot. Perfect for notifications, monitoring, and basic two-way communication.

## Key Capabilities

- Send messages to Discord channels
- Read recent messages from channels
- Automatic server discovery (works with single or multiple servers)
- Support for both channel names and IDs

# Available Tools

## send-message

Send a message to a Discord channel.

**Parameters:**
- `channel` (string, required): Channel name (e.g., "general") or channel ID
- `message` (string, required): Message content to send
- `server` (string, optional): Server name or ID (only needed if bot is in multiple servers)

**Returns:** Confirmation with message ID

**Example:**
```javascript
// If bot is in one server
await send_message({
  channel: "general",
  message: "Deployment completed successfully ✅"
});

// If bot is in multiple servers
await send_message({
  server: "My Server",
  channel: "general",
  message: "Hello from Kiro!"
});
```

## read-messages

Read recent messages from a Discord channel.

**Parameters:**
- `channel` (string, required): Channel name (e.g., "general") or channel ID
- `limit` (number, optional): Number of messages to fetch (1-100, default: 50)
- `server` (string, optional): Server name or ID (only needed if bot is in multiple servers)

**Returns:** Array of messages with author, content, and timestamp

**Example:**
```javascript
// Read last 10 messages
const messages = await read_messages({
  channel: "general",
  limit: 10
});

// Read from specific server
const messages = await read_messages({
  server: "My Server",
  channel: "support",
  limit: 20
});
```

# Common Workflows

## 1. Send Deployment Notification

Post automated deployment status to a channel.

```javascript
await send_message({
  channel: "deployments",
  message: "🚀 Production deployment v2.4.0 completed in 3m 42s"
});
```

## 2. Monitor Channel for Errors

Read recent messages and check for error patterns.

```javascript
const messages = await read_messages({
  channel: "logs",
  limit: 50
});

const errors = messages.filter(m => 
  m.content.includes("ERROR") || m.content.includes("FATAL")
);

if (errors.length > 0) {
  await send_message({
    channel: "alerts",
    message: `⚠️ Found ${errors.length} error messages in #logs`
  });
}
```

## 3. Read and Respond

Read messages and send automated responses.

```javascript
const messages = await read_messages({
  channel: "support",
  limit: 20
});

const questions = messages.filter(m => 
  m.content.includes("?") && !m.author.includes("Bot")
);

for (const q of questions) {
  await send_message({
    channel: "support",
    message: `Analyzing question from ${q.author}...`
  });
}
```

# Best Practices

## Message Formatting

Use Discord Markdown for formatting:
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Code block: ` ```language\ncode\n``` `

## Channel Identification

- Use channel names for simplicity: `"general"`, `"support"`
- Use channel IDs for precision: `"123456789012345678"`
- Specify server name/ID if bot is in multiple servers

## Rate Limits

- Discord has rate limits (5 messages per 5 seconds per channel)
- Add delays between messages if sending multiple
- Handle rate limit errors gracefully

## Security

- Never commit bot tokens to source control
- Use environment variables for tokens
- Regenerate tokens immediately if exposed
- Grant minimum required permissions

# Troubleshooting

## Authentication Errors

**Error: DISCORD_TOKEN environment variable is not set**
- Check `mcp.json` has `DISCORD_TOKEN` in env section
- Restart MCP server after updating config

**Error: 401 Unauthorized**
- Bot token is invalid or expired
- Regenerate token in Discord Developer Portal
- Update token in `mcp.json`

## Channel/Server Errors

**Error: Channel not found**
- Verify channel name spelling
- Check bot has access to the channel
- Try using channel ID instead of name

**Error: Bot is in multiple servers**
- Specify `server` parameter with server name or ID
- Check available servers in error message

## Permission Errors

**Error: Missing Permissions**
- Check bot role in server settings
- Verify bot has required permissions
- Re-invite bot with correct permissions URL

# Resources

- [Discord Developer Portal](https://discord.com/developers/docs/intro)
- [Discord.js Documentation](https://discord.js.org/)
- [discord-mcp GitHub](https://github.com/v-3/discordmcp)
