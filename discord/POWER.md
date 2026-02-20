---
name: "discord"
displayName: "Discord Communication"
description: "Integrate two-way Discord communication into your workflows - send and read messages, manage channels, search conversations, and connect with your Discord Bot for real-time server collaboration"
keywords: ["discord", "messaging", "channels", "notifications", "communication", "collaboration", "bots", "guild", "server"]
author: "Steven J Miklovic"
---

# Onboarding

Complete these steps before using this power.

## Step 1: Create a Discord Bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and click **New Application**
2. Name your application and click **Create**
3. Navigate to **Bot** → **Add Bot** → confirm
4. Click **Reset Token** to generate a Bot Token
5. Copy the **Bot Token** (it will look like: `YOUR_BOT_TOKEN_HERE`)

**SECURITY WARNING**: Never commit your Bot Token to source control. Store in environment variables or secrets manager. Regenerate immediately if exposed.

6. Configure permissions:
   - Navigate to **OAuth2** → **URL Generator**
   - Select scopes: `bot` and `applications.commands`
   - Select required permissions (see [Configuration](#configuration))
   - Copy the generated URL and invite bot to your server

**Required OAuth2 Scopes:**
- `bot` — Join servers and access basic functionality
- `applications.commands` — Enable slash commands

**Required Bot Permissions** (minimum):
- `View Channels` — Read channel structure
- `Send Messages` — Post messages
- `Read Message History` — Retrieve past messages
- `Add Reactions` — React to messages
- `Manage Channels` — Create/configure channels (if needed)
- `Manage Messages` — Pin messages and manage threads (if needed)

## Step 2: Configure the Bot Token

Add your Discord Bot Token to the MCP configuration:

1. Open the Discord power's `mcp.json` configuration
2. Set the `DISCORD_TOKEN` environment variable to your Bot Token from Step 1
3. Save and restart Kiro to connect

Example configuration:
```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "discord-mcp"],
      "env": {
        "DISCORD_TOKEN": "your_bot_token_here"
      }
    }
  }
}
```

# Overview

Discord integration using the community-maintained `discord-mcp` server. Connects to Discord servers via your Bot, enabling AI-assisted message reading and sending.

## Key Capabilities

**Message Operations**
- Send messages to Discord channels
- Read recent messages from channels
- Automatic server and channel discovery
- Support for both channel names and IDs and create new threads from messages
- Read channel history and thread messages
- Search messages across channels with filters

**Channel Management**
- List all channels in a guild
- Create new channels (text, voice, announcement)
- Add users to channels

**User Operations**
- List guild members with roles
- Get detailed user profiles

**Reactions**
- Add emoji reactions (Unicode and custom guild emoji)

**Two-Way Communication**
- Subscribe to Discord Gateway events for real-time updates
- Implement slash commands for user-triggered actions
- Use interaction components (buttons, select menus, modals)

# Available MCP Servers

## discord_send_message

Send a message to a specified channel.

**Parameters:**
- `channel_id` (string, required): Target channel ID
- `content` (string, required): Message text content (max 2000 characters)
- `embeds` (array, optional): Rich embed objects for formatted content

**Returns:** Message object with ID, timestamp, and content

**Errors:**
- Permission denied: Bot lacks Send Messages permission
- Channel not found: Invalid channel ID or bot not in channel
- Invalid content: Content exceeds 2000 characters or is empty

**Example:**
```javascript
await discord_send_message({
  channel_id: "123456789012345678",
  content: "Deployment to production completed successfully ✅"
});
```

## discord_reply_to_thread

Reply to an existing thread.

**Parameters:**
- `thread_id` (string, required): Target thread ID
- `content` (string, required): Reply message content
- `embeds` (array, optional): Rich embed objects

**Returns:** Message object

**Errors:**
- Permission denied: Bot lacks Send Messages permission
- Thread not found: Invalid thread ID
- Thread archived: Thread is archived and locked

**Example:**
```javascript
await discord_reply_to_thread({
  thread_id: "987654321098765432",
  content: "Investigation complete. Root cause identified in auth service."
});
```

## discord_create_thread

Create a new thread from a message.

**Parameters:**
- `channel_id` (string, required): Parent channel ID
- `message_id` (string, required): Message to create thread from
- `name` (string, required): Thread name (1-100 characters)
- `auto_archive_duration` (integer, optional): Minutes until auto-archive (60, 1440, 4320, 10080)

**Returns:** Thread channel object

**Errors:**
- Permission denied: Bot lacks Manage Threads permission
- Message not found: Invalid message ID
- Invalid name: Name empty or exceeds 100 characters

**Example:**
```javascript
await discord_create_thread({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  name: "Bug Investigation - Auth Timeout",
  auto_archive_duration: 1440
});
```

## discord_get_channel_history

Retrieve recent messages from a channel.

**Parameters:**
- `channel_id` (string, required): Target channel ID
- `limit` (integer, optional): Number of messages (default: 50, max: 100)
- `before` (string, optional): Get messages before this message ID
- `after` (string, optional): Get messages after this message ID

**Returns:** Array of message objects with content, author, timestamp

**Errors:**
- Permission denied: Bot lacks Read Message History permission
- Channel not found: Invalid channel ID

**Example:**
```javascript
const messages = await discord_get_channel_history({
  channel_id: "123456789012345678",
  limit: 20
});
```

## discord_get_thread_messages

Retrieve all messages from a thread.

**Parameters:**
- `thread_id` (string, required): Target thread ID
- `limit` (integer, optional): Number of messages to retrieve

**Returns:** Array of message objects in chronological order

**Errors:**
- Permission denied: Bot lacks Read Message History permission
- Thread not found: Invalid thread ID

**Example:**
```javascript
const threadMessages = await discord_get_thread_messages({
  thread_id: "987654321098765432",
  limit: 50
});
```

## discord_search_messages

Search for messages using text queries.

**Parameters:**
- `guild_id` (string, required): Guild to search within
- `query` (string, required): Search query text
- `channel_id` (string, optional): Limit search to specific channel
- `author_id` (string, optional): Limit search to specific author
- `limit` (integer, optional): Maximum results to return

**Returns:** Array of matching messages with context (channel, timestamp)

**Errors:**
- Permission denied: Bot lacks Read Message History permission
- Invalid query: Query is empty or malformed

**Example:**
```javascript
const errors = await discord_search_messages({
  guild_id: "999888777666555444",
  query: "ERROR: Database connection timeout",
  channel_id: "123456789012345678",
  limit: 10
});
```

## discord_list_channels

List all channels in a guild.

**Parameters:**
- `guild_id` (string, required): Target guild ID

**Returns:** Array of channel objects with ID, name, type

**Errors:**
- Permission denied: Bot lacks View Channels permission
- Guild not found: Invalid guild ID or bot not in guild

**Example:**
```javascript
const channels = await discord_list_channels({
  guild_id: "999888777666555444"
});
```

## discord_create_channel

Create a new channel in a guild.

**Parameters:**
- `guild_id` (string, required): Target guild ID
- `name` (string, required): Channel name (1-100 characters)
- `type` (integer, optional): Channel type (0=text, 2=voice, 5=announcement)
- `topic` (string, optional): Channel topic/description

**Returns:** Created channel object

**Errors:**
- Permission denied: Bot lacks Manage Channels permission
- Invalid name: Name contains invalid characters or exceeds length
- Name already exists: Channel with this name already exists

**Example:**
```javascript
const channel = await discord_create_channel({
  guild_id: "999888777666555444",
  name: "incident-2024-01-15",
  type: 0,
  topic: "Production incident - Database timeout investigation"
});
```

## discord_add_channel_member

Add a user to a channel.

**Parameters:**
- `channel_id` (string, required): Target channel ID
- `user_id` (string, required): User to add

**Returns:** Success confirmation

**Errors:**
- Permission denied: Bot lacks Manage Channels permission
- User not found: Invalid user ID
- Already member: User is already in the channel

**Example:**
```javascript
await discord_add_channel_member({
  channel_id: "123456789012345678",
  user_id: "555444333222111000"
});
```

## discord_list_guild_members

List all members in a guild.

**Parameters:**
- `guild_id` (string, required): Target guild ID
- `limit` (integer, optional): Number of members to retrieve

**Returns:** Array of member objects with user ID, username, display name, roles

**Errors:**
- Permission denied: Bot lacks View Server Members permission
- Guild not found: Invalid guild ID

**Example:**
```javascript
const members = await discord_list_guild_members({
  guild_id: "999888777666555444",
  limit: 100
});
```

## discord_get_user_profile

Retrieve detailed profile information for a user.

**Parameters:**
- `user_id` (string, required): Target user ID
- `guild_id` (string, optional): Guild context for roles/nickname

**Returns:** User object with username, display name, avatar URL, creation date, roles

**Errors:**
- User not found: Invalid user ID

**Example:**
```javascript
const profile = await discord_get_user_profile({
  user_id: "555444333222111000",
  guild_id: "999888777666555444"
});
```

## discord_add_reaction

Add an emoji reaction to a message.

**Parameters:**
- `channel_id` (string, required): Channel containing the message
- `message_id` (string, required): Target message ID
- `emoji` (string, required): Emoji identifier (Unicode or `name:id` for custom)

**Returns:** Success confirmation

**Errors:**
- Permission denied: Bot lacks Add Reactions permission
- Message not found: Invalid message ID
- Invalid emoji: Emoji identifier is malformed or doesn't exist

**Example:**
```javascript
// Unicode emoji
await discord_add_reaction({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  emoji: "✅"
});

// Custom guild emoji
await discord_add_reaction({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  emoji: "custom_emoji:123456789012345678"
});
```

# Common Workflows

## 1. Send Deployment Notification

Post automated deployment status to a dedicated channel.

```javascript
// Send deployment notification with embed
await discord_send_message({
  channel_id: "123456789012345678",
  content: "🚀 Deployment Status",
  embeds: [{
    title: "Production Deployment Complete",
    description: "Version 2.4.0 deployed successfully",
    color: 3066993, // Green
    fields: [
      { name: "Environment", value: "Production", inline: true },
      { name: "Version", value: "2.4.0", inline: true },
      { name: "Duration", value: "3m 42s", inline: true }
    ],
    timestamp: new Date().toISOString()
  }]
});

// Add success reaction
await discord_add_reaction({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  emoji: "✅"
});
```

## 2. Surface Error Alerts

Search for error messages and create incident thread.

```javascript
// Search for recent errors
const errors = await discord_search_messages({
  guild_id: "999888777666555444",
  query: "ERROR: Database connection",
  channel_id: "123456789012345678",
  limit: 5
});

// Create thread for investigation
if (errors.length > 0) {
  const thread = await discord_create_thread({
    channel_id: "123456789012345678",
    message_id: errors[0].id,
    name: "DB Connection Error Investigation",
    auto_archive_duration: 1440
  });
  
  // Post initial analysis
  await discord_reply_to_thread({
    thread_id: thread.id,
    content: `Found ${errors.length} related errors. Investigating root cause.`
  });
}
```

## 3. Read Channel History for Context

Retrieve recent messages to provide context for AI analysis.

```javascript
// Get recent messages from support channel
const messages = await discord_get_channel_history({
  channel_id: "123456789012345678",
  limit: 50
});

// Filter for user questions
const questions = messages.filter(m => 
  m.content.includes("?") && !m.author.bot
);

// Analyze and respond
for (const question of questions) {
  // AI processes question and generates response
  const response = await analyzeQuestion(question.content);
  
  await discord_send_message({
    channel_id: "123456789012345678",
    content: `<@${question.author.id}> ${response}`
  });
}
```

## 4. Create Incident Channel and Invite Team

Set up dedicated channel for incident response.

```javascript
// Create incident channel
const channel = await discord_create_channel({
  guild_id: "999888777666555444",
  name: "incident-2024-01-15-db-timeout",
  type: 0,
  topic: "Production incident - Database timeout investigation"
});

// Get on-call team members
const members = await discord_list_guild_members({
  guild_id: "999888777666555444"
});

const oncallTeam = members.filter(m => 
  m.roles.includes("oncall_role_id")
);

// Invite team members
for (const member of oncallTeam) {
  await discord_add_channel_member({
    channel_id: channel.id,
    user_id: member.user.id
  });
}

// Post initial incident report
await discord_send_message({
  channel_id: channel.id,
  content: `@here Incident detected: Database connection timeouts in production. Team assembled for investigation.`
});
```

## 5. Thread-Based Multi-Step Workflow

Use threads to organize multi-step incident updates.

```javascript
// Create thread for incident tracking
const thread = await discord_create_thread({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  name: "Incident Timeline - DB Timeout",
  auto_archive_duration: 4320 // 3 days
});

// Post investigation updates
await discord_reply_to_thread({
  thread_id: thread.id,
  content: "**10:15 AM** - Incident detected. Database response time >5s."
});

await discord_reply_to_thread({
  thread_id: thread.id,
  content: "**10:22 AM** - Root cause identified: Connection pool exhaustion."
});

await discord_reply_to_thread({
  thread_id: thread.id,
  content: "**10:35 AM** - Fix deployed. Connection pool size increased from 20 to 50."
});

await discord_reply_to_thread({
  thread_id: thread.id,
  content: "**10:45 AM** - Incident resolved. Response times back to normal (<100ms)."
});

// Add resolved reaction to original message
await discord_add_reaction({
  channel_id: "123456789012345678",
  message_id: "111222333444555666",
  emoji: "✅"
});
```

# Best Practices

## Message Formatting

**Use Discord Markdown**
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Code block: ` ```language\ncode\n``` `
- Quote: `> text`
- Spoiler: `||text||`

**Use Embeds for Rich Content**
- Structured data presentation
- Color-coded status indicators
- Organized field layouts
- Timestamps and author attribution

**Keep Messages Concise**
- Discord has 2000 character limit per message
- Split long content across multiple messages
- Use embeds for structured data instead of long text blocks

**Mention Users Appropriately**
- Direct mention: `<@user_id>`
- Role mention: `<@&role_id>`
- Channel mention: `<#channel_id>`
- Avoid @everyone/@here unless critical

## Channel Strategy

**Dedicated Channels for Automation**
- Create separate channels for bot notifications
- Prevents noise in general discussion channels
- Easier to filter and search automated messages

**Use Threads for Conversations**
- Keep main channel clean
- Organize multi-step workflows
- Auto-archive completed discussions

**Channel Naming Conventions**
- Use lowercase with hyphens: `incident-2024-01-15`
- Include date for time-bound channels
- Prefix by category: `deploy-`, `incident-`, `alert-`

## Rate Limits

**Discord API Rate Limits**
- Global: 50 requests per second
- Per-channel: 5 requests per 5 seconds for messages
- Per-guild: Varies by endpoint

**Implement Exponential Backoff**
```javascript
async function sendWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await discord_send_message(params);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

**Use Gateway Events Instead of Polling**
- Subscribe to Discord Gateway for real-time updates
- Avoid repeatedly calling get_channel_history
- More efficient and respects rate limits

## Security

**Protect Bot Token**
- Never commit tokens to source control
- Store in environment variables or secrets manager
- Use `.env` files with `.gitignore`
- Rotate tokens immediately if exposed

**Minimum Required Permissions**
- Grant only permissions needed for functionality
- Review permissions regularly
- Use role-based access control in Discord

**Validate User Input**
- Sanitize content before sending
- Validate channel/user IDs before operations
- Handle permission errors gracefully

**Audit Bot Actions**
- Log all bot operations
- Monitor for unusual activity
- Set up alerts for permission changes

## Two-Way Communication

**Discord Gateway Events**
- Subscribe to message events for real-time monitoring
- React to user messages automatically
- Build interactive conversation flows

**Slash Commands**
- Register commands for user-triggered actions
- Provide structured input with options
- Respond within 3-second timeout (use deferred responses for longer operations)

**Interaction Components**
- Buttons for quick actions
- Select menus for multiple choices
- Modals for form input
- Update messages dynamically based on interactions

**Example: Interactive Incident Response**
```javascript
// User triggers slash command: /incident create
// Bot responds with buttons
await discord_send_message({
  channel_id: "123456789012345678",
  content: "Incident created. Select severity:",
  components: [{
    type: 1, // Action row
    components: [
      { type: 2, custom_id: "sev1", label: "SEV1 - Critical", style: 4 },
      { type: 2, custom_id: "sev2", label: "SEV2 - High", style: 1 },
      { type: 2, custom_id: "sev3", label: "SEV3 - Medium", style: 2 }
    ]
  }]
});

// Bot receives interaction event when user clicks button
// Process severity selection and create incident channel
```

## Error Handling

**Handle Common Errors Gracefully**
- Permission denied: Check bot permissions and guide user to fix
- Not found: Validate IDs before operations
- Rate limited: Implement exponential backoff
- Invalid content: Validate before sending

**Provide Actionable Error Messages**
```javascript
try {
  await discord_send_message({ channel_id, content });
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    console.error(`Bot lacks Send Messages permission in channel ${channel_id}`);
    // Guide user to grant permission
  } else if (error.code === 'NOT_FOUND') {
    console.error(`Channel ${channel_id} not found. Verify channel ID.`);
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
}
```

**Log Errors with Context**
- Include operation type, parameters, and error details
- Track error patterns for debugging
- Set up monitoring and alerts

# Configuration

## Required Bot Permissions

Grant these permissions when inviting your bot to a server:

**Essential Permissions:**
- `View Channels` (1024) — Read channel structure
- `Send Messages` (2048) — Post messages
- `Read Message History` (65536) — Retrieve past messages
- `Add Reactions` (64) — React to messages

**Optional Permissions** (based on use case):
- `Manage Channels` (16) — Create/configure channels
- `Manage Messages` (8192) — Pin messages and manage threads
- `Manage Threads` (34359738368) — Create and manage threads
- `Embed Links` (16384) — Send rich embeds
- `Attach Files` (32768) — Upload files
- `Use External Emoji` (262144) — Use emoji from other servers

## Required OAuth2 Scopes

- `bot` — Join servers and access basic functionality
- `applications.commands` — Enable slash commands

## Permission Calculator

Calculate permission integer: [discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)

## Bot Invite URL Format

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=PERMISSION_INTEGER&scope=bot%20applications.commands
```

Replace:
- `YOUR_CLIENT_ID`: Application ID from Developer Portal
- `PERMISSION_INTEGER`: Sum of required permission values

# Troubleshooting

## Authentication Errors

**Error: Invalid Bot Token**
- Verify token format starts with `Bot ` prefix
- Regenerate token in Developer Portal if corrupted
- Check for whitespace or hidden characters

**Error: Unauthorized**
- Token may be revoked or expired
- Regenerate token in Developer Portal
- Update token in MCP configuration

## Permission Errors

**Error: Missing Permissions**
- Check bot role position in server hierarchy
- Verify required permissions are granted
- Re-invite bot with updated permissions URL

**Error: Cannot Send Messages**
- Bot lacks Send Messages permission in channel
- Channel may have permission overwrites blocking bot
- Check bot role and channel-specific permissions

## Channel Access Errors

**Error: Channel Not Found**
- Verify channel ID is correct
- Bot may not be in the server
- Channel may be deleted or archived

**Error: Cannot Read Message History**
- Bot lacks Read Message History permission
- Private channel without bot access
- Check channel permission overwrites

## Rate Limit Errors

**Error: Rate Limited (HTTP 429)**
- Implement exponential backoff
- Reduce request frequency
- Use Gateway events instead of polling
- Check `retry_after` header for wait duration

## Thread Errors

**Error: Thread Archived**
- Thread is archived and locked
- Unarchive thread before posting
- Check auto_archive_duration setting

**Error: Cannot Create Thread**
- Bot lacks Manage Threads permission
- Message already has a thread
- Channel doesn't support threads

## Two-Way Communication Errors

**Error: Interaction Timeout**
- Respond to interactions within 3 seconds
- Use deferred responses for longer operations
- Acknowledge interaction immediately, then update

**Error: Gateway Connection Failed**
- Check network connectivity
- Verify bot token is valid
- Discord Gateway may be experiencing issues

## General Debugging

**Enable Debug Logging**
- Log all MCP tool invocations
- Log Discord API responses
- Track rate limit headers

**Verify Bot Status**
- Check bot is online in Discord
- Verify bot is in target server
- Check bot role permissions

**Test with Discord API Directly**
- Use Discord API documentation to test endpoints
- Verify bot token works outside MCP server
- Isolate MCP server vs Discord API issues

# Resources

## Official Documentation

- [Discord Developer Portal](https://discord.com/developers/docs/intro) — Complete API reference
- [Discord API Documentation](https://discord.com/developers/docs/reference) — Endpoint specifications
- [Discord Gateway Documentation](https://discord.com/developers/docs/topics/gateway) — WebSocket events
- [Discord Permissions Calculator](https://discord.com/developers/docs/topics/permissions) — Permission bitwise flags
- [Discord Markdown Guide](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101) — Message formatting

## Community Resources

- [Discord Developers Server](https://discord.gg/discord-developers) — Official developer community
- [Discord API GitHub](https://github.com/discord/discord-api-docs) — API documentation source

## Rate Limits Reference

- [Rate Limits Documentation](https://discord.com/developers/docs/topics/rate-limits) — Detailed rate limit information
- Global: 50 requests per second
- Per-channel messages: 5 requests per 5 seconds
- Per-guild operations: Varies by endpoint

## Security Best Practices

- [OAuth2 Security](https://discord.com/developers/docs/topics/oauth2) — OAuth2 implementation guide
- [Bot Security Best Practices](https://discord.com/developers/docs/topics/gateway#privileged-intents) — Privileged intents and security

## MCP Protocol

- [Model Context Protocol Specification](https://modelcontextprotocol.io/) — MCP architecture and standards
