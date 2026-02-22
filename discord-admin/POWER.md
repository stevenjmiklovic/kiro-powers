---
name: discord-admin
displayName: Discord Server Moderator
description: Comprehensive Discord server administration through Docker-based MCP - manage roles, channels, categories, webhooks, users, and messages
keywords: discord, admin, administration, server management, roles, permissions, channels, categories, webhooks, moderation, user management, discord bot
author: Kiro
---

# Setup

## Prerequisites
- Docker installed and running
- Discord bot token with appropriate permissions
- Bot added to target Discord server(s)

## Configuration

Edit `mcp.json` and add your bot token:

```json
{
  "mcpServers": {
    "discord-admin": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "saseq/discord-mcp:latest"],
      "env": {
        "DISCORD_TOKEN": "YOUR_BOT_TOKEN_HERE",
        "DISCORD_GUILD_ID": ""
      }
    }
  }
}
```

Optionally set `DISCORD_GUILD_ID` for a default server.

## Bot Permissions Required

Minimum: View Channels, Send Messages, Read Message History

Additional by feature:
- Channel management: Manage Channels
- Role management: Manage Roles
- User management: Kick Members, Ban Members
- Webhook management: Manage Webhooks
- Message moderation: Manage Messages

# Available Tools

## Server Information

### get_server_info
Get server details including channels, roles, and member count.

Parameters:
- `server` (optional): Server name or ID

Returns: Server object with id, name, description, memberCount, channels, roles, categories

## User Management

### get_user_id_by_name
Look up user ID by username.

Parameters:
- `username` (required): Discord username
- `server` (optional): Server name or ID

Returns: User object with id, username, discriminator, found

### send_private_message
Send DM to a user.

Parameters:
- `userId` (required): User's Discord ID
- `content` (required): Message content (max 2000 chars)

Returns: Message object with id, channelId, content, timestamp

### edit_private_message
Edit a previously sent DM.

Parameters:
- `channelId` (required): DM channel ID
- `messageId` (required): Message ID to edit
- `content` (required): New content

Returns: Updated message object

### delete_private_message
Delete a DM sent by the bot.

Parameters:
- `channelId` (required): DM channel ID
- `messageId` (required): Message ID to delete

Returns: Confirmation with success, messageId, channelId

### read_private_message_history
Read DM history with a user.

Parameters:
- `channelId` (required): DM channel ID
- `limit` (optional): Max messages (default 50, max 100)

Returns: Array of message objects (newest first)

## Channel Messages

### send_channel_message
Send message to a channel.

Parameters:
- `channel` (required): Channel name or ID
- `message` (required): Message content (max 2000 chars)
- `server` (optional): Server name or ID

Returns: Message object with id, channelId, content, timestamp, author

### edit_channel_message
Edit a channel message sent by the bot.

Parameters:
- `channel` (required): Channel name or ID
- `messageId` (required): Message ID to edit
- `newContent` (required): New content
- `server` (optional): Server name or ID

Returns: Updated message object

### delete_channel_message
Delete a channel message.

Parameters:
- `channel` (required): Channel name or ID
- `messageId` (required): Message ID to delete
- `server` (optional): Server name or ID

Returns: Confirmation with success, messageId, channelId

Requires Manage Messages permission to delete others' messages.

### read_channel_message_history
Read channel message history.

Parameters:
- `channel` (required): Channel name or ID
- `limit` (optional): Max messages (default 50, max 100)
- `server` (optional): Server name or ID

Returns: Array of message objects with id, content, author, timestamp, edited, reactions, attachments

### add_reaction
Add emoji reaction to a message.

Parameters:
- `channel` (required): Channel name or ID
- `messageId` (required): Message ID
- `emoji` (required): Unicode emoji or custom emoji ID
- `server` (optional): Server name or ID

Returns: Confirmation with success, messageId, emoji, channelId

### remove_reaction
Remove emoji reaction from a message.

Parameters:
- `channel` (required): Channel name or ID
- `messageId` (required): Message ID
- `emoji` (required): Emoji to remove
- `userId` (optional): User whose reaction to remove (omit for bot's own)
- `server` (optional): Server name or ID

Returns: Confirmation with success, messageId, emoji, channelId

Requires Manage Messages to remove others' reactions.

## Channel Management

### create_channel
Create a new text channel.

Parameters:
- `name` (required): Channel name (2-100 chars, lowercase, hyphens)
- `categoryId` (optional): Parent category ID
- `topic` (optional): Channel topic (max 1024 chars)
- `position` (optional): Channel position (0-based)
- `server` (optional): Server name or ID

Returns: Channel object with id, name, type, categoryId, position, topic

Requires Manage Channels permission.

### delete_channel
Delete a channel permanently.

Parameters:
- `channel` (required): Channel name or ID
- `server` (optional): Server name or ID

Returns: Confirmation with success, channelId, channelName

WARNING: Destructive operation - all messages and history permanently deleted.

### find_channels
Search for channels by name pattern.

Parameters:
- `pattern` (required): Search pattern (supports wildcards)
- `server` (optional): Server name or ID

Returns: Array of matching channels with id, name, type, categoryId

### list_channels
List all channels in a server.

Parameters:
- `server` (optional): Server name or ID

Returns: Array of all channels with id, name, type, position, categoryId

## Category Management

### create_category
Create a channel category.

Parameters:
- `name` (required): Category name
- `position` (optional): Category position
- `server` (optional): Server name or ID

Returns: Category object with id, name, position

### delete_category
Delete a category (channels inside are not deleted, just uncategorized).

Parameters:
- `categoryId` (required): Category ID
- `server` (optional): Server name or ID

Returns: Confirmation with success, categoryId

### move_channel_to_category
Move a channel into a category.

Parameters:
- `channelId` (required): Channel ID to move
- `categoryId` (required): Target category ID
- `server` (optional): Server name or ID

Returns: Updated channel object

## Role Management

### create_role
Create a new role.

Parameters:
- `name` (required): Role name
- `color` (optional): Role color (hex code or integer)
- `permissions` (optional): Array of permission strings
- `hoist` (optional): Display separately (boolean)
- `mentionable` (optional): Allow @mention (boolean)
- `server` (optional): Server name or ID

Returns: Role object with id, name, color, permissions, position

### edit_role
Modify an existing role.

Parameters:
- `roleId` (required): Role ID to edit
- `name` (optional): New name
- `color` (optional): New color
- `permissions` (optional): New permissions array
- `hoist` (optional): Display separately
- `mentionable` (optional): Allow @mention
- `server` (optional): Server name or ID

Returns: Updated role object

### delete_role
Delete a role.

Parameters:
- `roleId` (required): Role ID to delete
- `server` (optional): Server name or ID

Returns: Confirmation with success, roleId

### assign_role
Assign a role to a user.

Parameters:
- `userId` (required): User ID
- `roleId` (required): Role ID to assign
- `server` (optional): Server name or ID

Returns: Confirmation with success, userId, roleId

### remove_role
Remove a role from a user.

Parameters:
- `userId` (required): User ID
- `roleId` (required): Role ID to remove
- `server` (optional): Server name or ID

Returns: Confirmation with success, userId, roleId

### list_roles
List all roles in a server.

Parameters:
- `server` (optional): Server name or ID

Returns: Array of roles with id, name, color, permissions, position, hoist, mentionable

## Webhook Management

### create_webhook
Create a webhook for a channel.

Parameters:
- `channel` (required): Channel name or ID
- `name` (required): Webhook name
- `avatar` (optional): Avatar URL
- `server` (optional): Server name or ID

Returns: Webhook object with id, name, token, url, channelId

### delete_webhook
Delete a webhook.

Parameters:
- `webhookId` (required): Webhook ID
- `server` (optional): Server name or ID

Returns: Confirmation with success, webhookId

### list_webhooks
List webhooks in a channel.

Parameters:
- `channel` (required): Channel name or ID
- `server` (optional): Server name or ID

Returns: Array of webhooks with id, name, channelId, token

### send_webhook_message
Send a message via webhook.

Parameters:
- `webhookId` (required): Webhook ID
- `webhookToken` (required): Webhook token
- `content` (required): Message content
- `username` (optional): Override webhook username
- `avatarUrl` (optional): Override webhook avatar

Returns: Message object

# Common Patterns

## Multi-Server Operations
When bot is in multiple servers, specify `server` parameter by name or ID. Set `DISCORD_GUILD_ID` for a default server.

## Rate Limiting
Discord enforces rate limits. Add delays between bulk operations:
```javascript
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Error Handling
All operations may fail due to permissions, rate limits, or invalid parameters. Implement proper error handling.

## Message Formatting
Supports Discord markdown: **bold**, *italic*, `code`, ```code blocks```, > quotes, etc.

## Permission Hierarchy
Bot can only manage roles/users below its highest role in the hierarchy.

# Security Notes

- Store bot token securely, never commit to version control
- Grant minimum required permissions
- Implement access controls for destructive operations
- Audit log all administrative actions
- Validate user input before using in operations
- Never send sensitive data via Discord messages
- Rotate bot token if compromised
