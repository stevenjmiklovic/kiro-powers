---
name: "discord"
displayName: "Discord Communication"
description: "Integrate two-way Discord communication into your workflows - send and read messages, manage channels, search conversations, and connect with your Discord Bot for real-time server collaboration"
keywords: ["discord", "messaging", "channels", "notifications", "communication", "collaboration", "bots", "server"]
author: "Steven J Miklovic"
---

# Onboarding

Before proceeding, validate that the user has completed the following steps before using this power.

## Step 1: Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and click **New Application**
2. Give it a name, then navigate to the **Bot** tab
3. Click **Add Bot** and confirm
4. Under **Privileged Gateway Intents**, enable:
   - **Message Content Intent**
   - **Server Members Intent**
   - **Presence Intent**
5. Click **Reset Token** (or **Copy** if shown) to obtain your **Bot Token** — you will need this to authenticate
6. Under **OAuth2 → URL Generator**, select the `bot` scope and the required permissions (see [Configuration](#configuration) below), then use the generated URL to invite the bot to your server

## Step 2: Connect the MCP Server

Authenticate through Kiro Powers UI when installing this power, using the Bot Token obtained in Step 1.

# Overview

Integrate real-time, two-way Discord communication into your AI-assisted workflows. This power connects to your Discord server via a Discord Bot, enabling you to send messages, read channel history, search conversations, manage channels, handle forum posts, and respond to events programmatically.

Use this power to send automated notifications when deployments complete, surface errors from your observability stack directly into Discord, build interactive bots, or query conversation history for context during debugging.

**Key capabilities:**

- **Send Messages**: Post messages to channels by name or ID
- **Read Messages**: Retrieve channel history for context
- **Search**: Search messages across a server
- **Channel Management**: List, create, and delete text channels; manage forum channels
- **Server Info**: Inspect servers and their members
- **Reactions**: Add and remove emoji reactions on messages
- **Webhooks**: Create, edit, delete, and send messages via webhooks
- **Forum Posts**: Create, read, reply to, and delete forum posts
- **Two-Way Communication**: Listen for and respond to messages through your Discord Bot

**Authentication**: Requires a Discord Bot Token from the Discord Developer Portal.

## Available MCP Servers

### discord

**Connection:** Local stdio MCP server via `npx mcp-discord`
**Authorization:** Discord Bot Token provided via `DISCORD_TOKEN` environment variable

**Key tools:**

- `discord_login` – Authenticate the bot with Discord using the configured token
- `discord_list_servers` – List all Discord servers the bot is a member of
- `discord_get_server_info` – Get detailed information about a Discord server
- `discord_send` – Send a message to a channel (by name or ID)
- `discord_read_messages` – Read recent messages from a channel
- `discord_search_messages` – Search messages across a server
- `discord_create_text_channel` – Create a new text channel
- `discord_delete_channel` – Delete an existing channel
- `discord_add_reaction` – Add an emoji reaction to a message
- `discord_add_multiple_reactions` – Add multiple emoji reactions to a message
- `discord_remove_reaction` – Remove a reaction from a message
- `discord_delete_message` – Delete a specific message from a channel
- `discord_get_forum_channels` – List forum channels in a server
- `discord_create_forum_post` – Create a new forum post
- `discord_get_forum_post` – Retrieve a forum post and its replies
- `discord_reply_to_forum` – Reply to an existing forum post
- `discord_delete_forum_post` – Delete a forum post
- `discord_create_webhook` – Create a webhook for a channel
- `discord_send_webhook_message` – Send a message via a webhook
- `discord_edit_webhook` – Edit an existing webhook
- `discord_delete_webhook` – Delete an existing webhook

## Common Workflows

### Workflow 1: Send a Deployment Notification

```javascript
// Post a formatted message to a channel when a deployment finishes
discord_send({
  channel: "deployments",
  message: "🚀 **Production deployment complete**\nVersion `v2.4.1` deployed successfully.",
})
```

### Workflow 2: Surface an Error Alert

```javascript
// Search for recent error messages and forward them to an alerts channel
const results = discord_search_messages({
  server: "My Server",
  query: "error",
  limit: 5,
})

discord_send({
  channel: "on-call",
  message: `Found recent errors:\n${results.map(m => `• ${m.content}`).join("\n")}`,
})
```

### Workflow 3: Read Channel History for Context

```javascript
// Retrieve the last 20 messages from a channel for context
const messages = discord_read_messages({
  channel: "backend-logs",
  limit: 20,
})

// Process messages for relevant context
```

### Workflow 4: Create an Incident Channel

```javascript
// Create a new incident channel and notify the team
discord_create_text_channel({
  server: "My Server",
  channel_name: "incident-2024-09-15",
})

discord_send({
  channel: "incident-2024-09-15",
  message: "🚨 Incident channel created. Please triage the issue.",
})
```

### Workflow 5: Manage Forum Posts

```javascript
// Create a forum post for a new feature discussion
discord_create_forum_post({
  channel: "feature-requests",
  title: "Dark mode support",
  content: "Proposal to add dark mode to the dashboard.",
})

// Later, reply with a status update
discord_reply_to_forum({
  post_id: "1234567890",
  content: "We've added dark mode — shipping in v3.1!",
})
```

### Workflow 6: Send via Webhook

```javascript
// Create a webhook for a channel and use it for automated messages
const webhook = discord_create_webhook({
  channel: "alerts",
  name: "CI/CD Bot",
})

discord_send_webhook_message({
  webhook_id: webhook.id,
  webhook_token: webhook.token,
  message: "Build #42 passed all tests ✅",
})
```

## Best Practices

### Message Formatting

- Use [Discord Markdown](https://support.discord.com/hc/en-us/articles/210298617) for formatting: `**bold**`, `*italic*`, `` `code` ``, ` ```code block``` `
- Keep automated messages concise; use thread replies for follow-up details
- Always include context (environment, version, timestamp) in automated notifications
- Mention roles or users sparingly and only when action is required (e.g., `@on-call`)

### Channel Strategy

- Use dedicated channels for automated notifications (e.g., `#deployments`, `#alerts`, `#incidents`)
- Avoid posting to `#general` from bots — prefer purpose-specific channels
- Use forum channels for structured discussions (e.g., feature requests, incident post-mortems)
- Delete or archive channels when incidents or projects are resolved

### Rate Limits

- Discord enforces [rate limits](https://discord.com/developers/docs/topics/rate-limits) per route; most message endpoints allow ~5 requests per 5 seconds per channel
- Avoid tight polling loops; prefer webhook-based or event-driven patterns where possible
- Implement exponential backoff when receiving HTTP 429 responses

### Tokens and Security

- **Never commit** Bot Tokens to source control
- Store tokens in environment variables or your secrets manager
- Grant only the minimum required bot permissions
- Rotate tokens immediately if they are ever exposed
- Use webhooks for one-way notifications where interactive bot features are not needed

### Two-Way Communication

- Use [Discord Gateway](https://discord.com/developers/docs/topics/gateway) events via your bot to receive and react to incoming messages
- Respond to commands using slash commands or message prefix patterns
- Use ephemeral messages (only visible to the invoking user) for sensitive bot responses

## Configuration

**Authentication Required**: Discord Bot Token

**Required Bot Permissions** (configure via OAuth2 URL Generator in the Developer Portal):

| Permission | Purpose |
|---|---|
| `View Channel` | Read channels and messages |
| `Send Messages` | Post messages to channels |
| `Read Message History` | Access past messages |
| `Manage Messages` | Delete messages (moderation) |
| `Manage Channels` | Create and delete channels |
| `Add Reactions` | React to messages with emoji |
| `Manage Webhooks` | Create, edit, and delete webhooks |
| `Create Public Threads` | Post in forum channels |
| `Send Messages in Threads` | Reply to forum posts |
| `Manage Threads` | Delete forum posts |

**Required Privileged Gateway Intents** (enable in Bot settings):

- **Message Content Intent** — Required to read message content
- **Server Members Intent** — Required to list server members
- **Presence Intent** — Required for presence-related features

**Setup Steps:**

1. Create a Discord Application at [discord.com/developers/applications](https://discord.com/developers/applications)
2. Add a Bot to the application and copy the **Bot Token**
3. Enable the required Privileged Gateway Intents in the Bot settings
4. Use the OAuth2 URL Generator to invite the bot with the required permissions
5. Configure the token in Kiro Powers UI when installing this power

**MCP Configuration:**

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "mcp-discord"],
      "env": {
        "DISCORD_TOKEN": "${DISCORD_TOKEN}"
      }
    }
  }
}
```

## Troubleshooting

### Error: "TOKEN_INVALID" or authentication failure

**Cause:** Missing or invalid Bot Token
**Solution:**

1. Verify the token was copied correctly from the Discord Developer Portal
2. Reset the token in the Developer Portal under **Bot → Reset Token** and update your configuration
3. Ensure the token is correctly set in the `DISCORD_TOKEN` environment variable

### Error: "Missing Permissions"

**Cause:** The bot lacks the required permission for the requested action
**Solution:**

1. Go to your application at [discord.com/developers/applications](https://discord.com/developers/applications)
2. Re-generate the OAuth2 invite URL with the missing permissions added
3. Re-invite the bot to your server using the new URL, or update permissions directly in server settings

### Error: "Unknown Channel" or channel not found

**Cause:** The channel name or ID is invalid, or the bot cannot see the channel
**Solution:**

1. Use `discord_get_server_info` to list available channels and their IDs
2. Ensure the bot has **View Channel** permission for the target channel
3. For private channels, explicitly grant the bot access in channel settings

### Error: "Missing Access" when posting

**Cause:** The bot is not a member of the channel or lacks **Send Messages** permission
**Solution:**

1. Add the bot to the channel or grant it **Send Messages** permission in channel settings
2. Use `discord_list_servers` to confirm the bot is in the correct server

### Messages not received (two-way communication)

**Cause:** **Message Content Intent** is not enabled
**Solution:**

1. In the Discord Developer Portal, go to your application → **Bot**
2. Enable **Message Content Intent** under Privileged Gateway Intents
3. Restart the MCP server to apply the change

### Rate limit errors (HTTP 429)

**Cause:** Too many API requests in a short period
**Solution:**

1. Implement exponential backoff and retry logic
2. Reduce message frequency; avoid polling in tight loops
3. Review [Discord rate limit documentation](https://discord.com/developers/docs/topics/rate-limits) for route-specific limits

## Resources

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Developer Documentation](https://discord.com/developers/docs)
- [Discord Markdown Formatting](https://support.discord.com/hc/en-us/articles/210298617)
- [Discord Rate Limits](https://discord.com/developers/docs/topics/rate-limits)
- [Discord Gateway Events](https://discord.com/developers/docs/topics/gateway)
- [Privileged Gateway Intents](https://discord.com/developers/docs/topics/gateway#privileged-intents)
- [mcp-discord npm package](https://www.npmjs.com/package/mcp-discord)

---

**License:** Proprietary
