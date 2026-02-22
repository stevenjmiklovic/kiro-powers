---
inclusion: always
---

# Discord Admin Power - Best Practices for AI Agents

This document provides guidance for AI agents using the discord-admin power to perform Discord server administration tasks safely and effectively.

## Authentication and Security

### Token Security

**CRITICAL: Discord bot tokens are sensitive credentials that provide full access to your bot's capabilities.**

- **Never log or display bot tokens** in responses, error messages, or debug output
- **Never commit tokens to version control** - tokens should only exist in mcp.json or environment variables
- **Treat token exposure as a security incident** - if a token is accidentally exposed, regenerate it immediately in the Discord Developer Portal
- **Use environment variables** for token storage when possible instead of hardcoding in configuration files
- **Verify token permissions** match the principle of least privilege - only grant permissions actually needed

### Token Storage Best Practices

When configuring the discord-admin power:

1. **Store tokens in mcp.json with restricted file permissions**
   - Set file permissions to 600 (read/write for owner only) on Unix systems
   - Keep mcp.json out of version control using .gitignore

2. **Use environment variable substitution when available**
   - Some MCP implementations support environment variable expansion
   - Example: `"DISCORD_TOKEN": "${DISCORD_BOT_TOKEN}"`

3. **Separate tokens by environment**
   - Use different bot tokens for development, staging, and production
   - Never use production tokens in development environments

4. **Document token location** for team members without exposing the token itself
   - Example: "Bot token is stored in mcp.json - contact admin for access"

### Token Rotation Procedures

Regular token rotation reduces the impact of potential token compromise:

1. **Scheduled Rotation** (recommended every 90 days)
   - Generate new token in Discord Developer Portal (Bot section)
   - Update mcp.json with new token
   - Verify bot connectivity with test operation
   - Revoke old token in Developer Portal

2. **Emergency Rotation** (when token may be compromised)
   - Immediately regenerate token in Discord Developer Portal
   - Update all systems using the token
   - Revoke old token immediately
   - Review audit logs for unauthorized activity
   - Document the incident and response

3. **Rotation Checklist**
   - [ ] Generate new token in Discord Developer Portal
   - [ ] Update mcp.json or environment variables
   - [ ] Test bot connectivity (use get_server_info)
   - [ ] Verify administrative operations work
   - [ ] Revoke old token
   - [ ] Update documentation with rotation date

### Permission Management

**Apply the principle of least privilege** - only grant permissions the bot actually needs.

#### Required Permissions by Feature

When configuring bot permissions in Discord, enable only what you need:

**Server Information**
- `View Channels` - Required to see server structure

**Message Management**
- `View Channels` - Required to see channels
- `Send Messages` - Required to send messages
- `Read Message History` - Required to read past messages
- `Add Reactions` - Required to add reactions
- `Manage Messages` - Required to edit/delete messages (powerful - use carefully)

**Channel Management**
- `View Channels` - Required to see existing channels
- `Manage Channels` - Required to create/delete/modify channels (powerful - use carefully)

**Role Management**
- `View Channels` - Required to see server structure
- `Manage Roles` - Required to create/modify/assign roles (powerful - use carefully)
- Note: Bot can only manage roles below its highest role in the hierarchy

**Webhook Management**
- `View Channels` - Required to see channels
- `Manage Webhooks` - Required to create/delete webhooks

**User Management**
- `View Channels` - Required to see server
- `Send Messages` - Required for private messages
- `Read Message History` - Required to read private message history

#### Permission Verification

Before performing administrative operations:

1. **Check bot has required permissions** for the operation
2. **Verify role hierarchy** - bot cannot manage roles above its own
3. **Confirm channel access** - bot must have access to target channels
4. **Test with non-destructive operations first** (e.g., list before delete)

#### Permission Errors

When you encounter permission errors:

1. **Identify the specific permission needed** from the error message
2. **Verify bot role has that permission** in Discord server settings
3. **Check role hierarchy** for role management operations
4. **Confirm channel-specific permissions** if operation is channel-scoped
5. **Inform the user** what permission is needed and how to grant it

### Security Best Practices for Operations

#### Destructive Operations

**Always confirm before destructive operations:**

- Deleting channels, roles, or categories
- Removing users from roles
- Deleting messages in bulk
- Deleting webhooks

**Recommended pattern:**
1. List or describe what will be affected
2. Ask user to confirm the operation
3. Perform the operation
4. Report what was changed

#### Audit Logging

**Maintain awareness of Discord's audit log:**

- All administrative operations are logged by Discord
- Server administrators can see who (which bot) performed actions
- Include context in operation names when possible
- Consider maintaining your own audit log for complex workflows

#### Rate Limiting Awareness

**Discord enforces rate limits on API operations:**

- Be aware that rapid operations may hit rate limits
- Implement exponential backoff when rate limited
- Batch operations when possible to reduce API calls
- See "Rate Limiting" section below for detailed strategies

## Operational Best Practices

### Administrative Operations

When performing administrative operations, follow these guidelines to ensure safe and effective server management:

#### Principle of Least Privilege

**Always operate with the minimum permissions necessary:**

1. **Grant only required permissions** to the bot role
   - Review the "Required Permissions by Feature" section above
   - Avoid granting "Administrator" permission unless absolutely necessary
   - Use specific permissions (Manage Channels, Manage Roles) instead of broad permissions

2. **Scope operations narrowly**
   - Target specific channels, roles, or users rather than server-wide operations
   - Use find/list operations to identify targets before acting
   - Verify targets match expectations before proceeding

3. **Limit bot access to sensitive channels**
   - Use channel-specific permission overrides to restrict bot access
   - Keep bot out of private/admin channels unless needed
   - Review bot's channel access regularly

4. **Regular permission audits**
   - Periodically review bot's granted permissions
   - Remove permissions no longer needed
   - Document why each permission is required

#### Destructive Operation Warnings

**CRITICAL: Some operations cannot be undone. Exercise extreme caution.**

**Irreversible Operations:**

- **Deleting channels** - All messages and history are permanently lost
- **Deleting roles** - Role assignments and permissions are lost
- **Deleting categories** - Category organization is lost (channels remain)
- **Deleting webhooks** - Webhook URL and token become invalid
- **Deleting messages** - Message content is permanently removed

**Safe Operation Pattern:**

Before any destructive operation:

1. **Verify the target** - Use list/find operations to confirm what will be affected
   ```javascript
   // Example: Verify channel before deletion
   const channels = await find_channels({ name: "old-channel" });
   // Confirm this is the right channel with the user
   await delete_channel({ channelId: channels[0].id });
   ```

2. **Inform the user** - Clearly state what will be deleted and the consequences
   - "This will permanently delete the #announcements channel and all its message history"
   - "This will remove the @moderator role from 15 users"

3. **Request explicit confirmation** - Don't proceed without user approval
   - Ask: "Are you sure you want to proceed with this deletion?"
   - Wait for clear affirmative response

4. **Provide alternatives** - Suggest non-destructive options when appropriate
   - Archive instead of delete (rename channel to "archived-channelname")
   - Remove permissions instead of deleting roles
   - Move channels to archive category instead of deletion

5. **Report results** - Confirm what was changed after operation completes
   - "Successfully deleted channel #old-announcements"
   - "Removed @moderator role from 15 users"

**Recovery Options:**

While most operations are irreversible, some mitigation strategies exist:

- **Channel deletion** - No recovery; emphasize backup/export before deletion
- **Role deletion** - Must recreate role and reassign; consider documenting role members first
- **Message deletion** - No recovery; consider archiving important channels before bulk deletion
- **Webhook deletion** - Must recreate webhook; document webhook URLs before deletion

#### Audit Logging Recommendations

**Maintain operational awareness and accountability:**

1. **Discord's Built-in Audit Log**
   - All administrative operations are automatically logged by Discord
   - Server administrators can view audit logs in Server Settings > Audit Log
   - Logs include: action type, actor (bot), target, timestamp
   - Logs are retained for 90 days

2. **Operation Context**
   - When performing operations, be aware they're logged
   - Discord audit log will show your bot as the actor
   - Server admins can see all bot actions

3. **External Audit Logging** (recommended for production use)
   
   Consider maintaining your own audit log for:
   - Complex multi-step workflows
   - Operations requiring justification/approval
   - Compliance or regulatory requirements
   - Troubleshooting and debugging
   
   **What to log:**
   - Timestamp of operation
   - Operation type (create_channel, delete_role, etc.)
   - Target (channel name, role name, user ID)
   - Outcome (success/failure)
   - User who requested the operation (if applicable)
   - Reason or context for the operation
   
   **Example audit log entry:**
   ```json
   {
     "timestamp": "2024-01-15T10:30:00Z",
     "operation": "delete_channel",
     "target": "old-announcements (ID: 123456789)",
     "outcome": "success",
     "requested_by": "admin_user",
     "reason": "Channel no longer needed after server reorganization"
   }
   ```

4. **Audit Log Best Practices**
   - Log before and after state for destructive operations
   - Include enough context to understand why operation was performed
   - Store logs securely with appropriate retention period
   - Review logs periodically for unusual patterns
   - Use logs for troubleshooting and compliance

5. **Change Tracking for Complex Operations**
   
   For multi-step workflows (e.g., server setup, reorganization):
   - Document the planned changes before execution
   - Track each step's completion status
   - Log any deviations from the plan
   - Provide summary of all changes at completion
   
   **Example workflow tracking:**
   ```
   Server Reorganization - 2024-01-15
   Planned Changes:
   - Create 3 new channels: #general-chat, #announcements, #support
   - Create 2 roles: @member, @supporter
   - Delete 2 old channels: #old-general, #old-support
   
   Execution Log:
   ✓ Created #general-chat (ID: 111111)
   ✓ Created #announcements (ID: 222222)
   ✓ Created #support (ID: 333333)
   ✓ Created @member role (ID: 444444)
   ✓ Created @supporter role (ID: 555555)
   ✓ Deleted #old-general
   ✓ Deleted #old-support
   
   Result: All planned changes completed successfully
   ```

#### Operational Safety Checklist

Before performing administrative operations:

- [ ] **Verify permissions** - Bot has required permissions for the operation
- [ ] **Confirm target** - Using list/find operations to identify correct target
- [ ] **Check impact** - Understand what will be affected by the operation
- [ ] **Review reversibility** - Know whether operation can be undone
- [ ] **Get approval** - User has explicitly confirmed destructive operations
- [ ] **Document intent** - Reason for operation is clear and logged
- [ ] **Test in dev** - Complex operations tested in development server first
- [ ] **Plan rollback** - Know how to recover if something goes wrong
- [ ] **Monitor result** - Verify operation completed as expected
- [ ] **Update documentation** - Record changes made to server configuration

## Channel and Category Management Best Practices

### Channel Organization Strategies

**Maintain a logical and scalable channel structure:**

1. **Use categories for grouping related channels**
   - Group channels by topic, team, or function
   - Example: "Development" category containing #dev-general, #dev-backend, #dev-frontend
   - Limit categories to 5-10 channels each for better organization
   - Use category permissions to control access to all channels within

2. **Follow consistent naming conventions**
   - Use lowercase with hyphens: #general-chat, #project-updates
   - Include prefixes for channel types: #dev-, #team-, #project-
   - Keep names concise but descriptive (2-3 words maximum)
   - Avoid special characters that may cause confusion

3. **Channel lifecycle management**
   - Archive inactive channels instead of deleting (rename to "archived-channelname")
   - Move archived channels to an "Archive" category
   - Regularly review channel usage and consolidate underused channels
   - Document channel purpose in channel topic/description

4. **Channel creation best practices**
   ```javascript
   // Good: Create channel with clear purpose and category
   await create_channel({
     name: "project-alpha",
     category: "Projects",
     topic: "Discussion and updates for Project Alpha"
   });
   
   // Avoid: Creating channels without context
   await create_channel({ name: "random-stuff" });
   ```

### Category Management Patterns

**Effective category usage:**

1. **Standard category structure**
   - Information: #announcements, #rules, #welcome
   - General: #general-chat, #introductions, #off-topic
   - Projects: Project-specific channels
   - Teams: Team-specific channels
   - Archive: Inactive channels

2. **Category permissions**
   - Set permissions at category level to apply to all channels within
   - Use category permissions for role-based access control
   - Override category permissions on specific channels only when necessary
   - Document permission inheritance in channel topics

3. **Category limits**
   - Discord allows 50 channels per category
   - Keep categories focused (5-15 channels is optimal)
   - Create new categories when logical groupings emerge
   - Avoid deeply nested organizational structures

### Channel Discovery and Navigation

**Help users find the right channels:**

1. **Use channel topics effectively**
   - Set clear, concise channel topics describing purpose
   - Include relevant links or resources in topics
   - Update topics when channel purpose changes

2. **Channel ordering**
   - Order channels by importance or usage frequency
   - Place announcement/info channels at the top
   - Group related channels together within categories
   - Use consistent ordering across similar categories

3. **Channel cleanup procedures**
   ```javascript
   // Safe pattern: List before cleanup
   const channels = await list_channels();
   const inactiveChannels = channels.filter(/* identify inactive */);
   
   // Inform user of cleanup plan
   // Get confirmation
   
   // Archive instead of delete
   for (const channel of inactiveChannels) {
     await edit_channel({
       channelId: channel.id,
       name: `archived-${channel.name}`,
       category: "Archive"
     });
   }
   ```

## Role Management and Permission Hierarchy Best Practices

### Role Hierarchy Understanding

**Discord's role hierarchy is critical for proper role management:**

1. **Role position determines power**
   - Roles are ordered from highest (top) to lowest (bottom)
   - Higher roles can manage lower roles
   - A role cannot manage roles at or above its position
   - Bot's highest role determines what it can manage

2. **Bot role positioning**
   - Place bot role above all roles it needs to manage
   - Keep bot role below admin/owner roles for safety
   - Verify role hierarchy before role management operations
   - Example hierarchy: Owner > Admin > Bot > Moderator > Member

3. **Role hierarchy errors**
   ```javascript
   // This will fail if bot role is below target role
   await assign_role({ userId: "123", roleId: "456" });
   
   // Safe pattern: Check hierarchy first
   const roles = await list_roles();
   const botRole = roles.find(r => r.tags?.botId === "your-bot-id");
   const targetRole = roles.find(r => r.id === "456");
   
   if (targetRole.position >= botRole.position) {
     // Inform user: "Cannot manage this role - it's at or above bot's role"
   }
   ```

### Role Creation and Configuration

**Design roles with clear purpose and minimal permissions:**

1. **Role naming conventions**
   - Use clear, descriptive names: @Moderator, @Developer, @Supporter
   - Avoid generic names: @Role1, @New Role
   - Use consistent capitalization
   - Consider emoji prefixes for visual distinction

2. **Permission assignment principles**
   - Start with no permissions and add only what's needed
   - Avoid granting "Administrator" permission except for admin roles
   - Use specific permissions instead of broad ones
   - Document why each permission is granted

3. **Role color coding**
   - Use colors to visually distinguish role types
   - Maintain consistent color scheme across similar roles
   - Reserve bright colors for important roles (admin, moderator)
   - Use muted colors for general member roles

4. **Role creation pattern**
   ```javascript
   // Good: Create role with specific permissions
   await create_role({
     name: "Content Moderator",
     permissions: ["VIEW_CHANNELS", "MANAGE_MESSAGES", "KICK_MEMBERS"],
     color: 0x3498db, // Blue
     mentionable: true,
     reason: "Role for content moderation team"
   });
   
   // Avoid: Creating role with excessive permissions
   await create_role({
     name: "Helper",
     permissions: ["ADMINISTRATOR"] // Too broad!
   });
   ```

### Role Assignment Patterns

**Assign roles thoughtfully and track assignments:**

1. **Role assignment verification**
   ```javascript
   // Safe pattern: Verify before assigning
   const user = await get_user_id_by_name({ username: "john" });
   const role = await find_role({ name: "Member" });
   
   // Check if user already has role
   const serverInfo = await get_server_info();
   const member = serverInfo.members.find(m => m.id === user.id);
   
   if (!member.roles.includes(role.id)) {
     await assign_role({ userId: user.id, roleId: role.id });
   }
   ```

2. **Bulk role assignment**
   - Assign roles one at a time to avoid rate limits
   - Implement delays between assignments (100-200ms)
   - Track successful and failed assignments
   - Report results to user

3. **Role removal safety**
   - Verify user has the role before attempting removal
   - Consider implications of removing roles (access loss)
   - Inform user of access changes when removing roles
   - Log role removals for audit purposes

### Permission Inheritance and Overrides

**Understand how permissions cascade:**

1. **Server-level permissions**
   - Roles grant server-wide permissions
   - @everyone role sets baseline permissions for all users
   - User's permissions = union of all their roles' permissions

2. **Channel-level permission overrides**
   - Channel permissions can override role permissions
   - Explicit "Allow" overrides role permissions
   - Explicit "Deny" overrides role permissions and explicit allows
   - Use channel overrides sparingly for clarity

3. **Permission calculation order**
   - Start with @everyone role permissions
   - Add permissions from all user's roles
   - Apply channel-specific permission overrides
   - Explicit denies take precedence over allows

4. **Best practices for permission management**
   - Use roles for broad permission grants
   - Use channel overrides only for exceptions
   - Document permission structure for complex setups
   - Regularly audit effective permissions

## Webhook Security and Validation Best Practices

### Webhook Token Protection

**Webhook URLs contain sensitive tokens that must be protected:**

1. **Webhook URL structure**
   - Format: `https://discord.com/api/webhooks/{webhook.id}/{webhook.token}`
   - The token portion grants full access to send messages via webhook
   - Anyone with the URL can send messages as the webhook
   - Treat webhook URLs as secrets

2. **Webhook token security**
   - **Never log or display webhook URLs** in responses or error messages
   - **Never commit webhook URLs to version control**
   - **Store webhook URLs securely** with same precautions as bot tokens
   - **Regenerate webhooks** if URLs are accidentally exposed
   - **Use environment variables** for webhook URL storage

3. **Webhook URL handling pattern**
   ```javascript
   // Good: Store webhook ID, retrieve URL when needed
   const webhookId = "123456789";
   const webhooks = await list_webhooks({ channelId: "channel-id" });
   const webhook = webhooks.find(w => w.id === webhookId);
   
   // Use webhook without exposing URL
   await send_webhook_message({
     webhookId: webhook.id,
     webhookToken: webhook.token,
     content: "Message"
   });
   
   // Avoid: Logging or displaying webhook URLs
   console.log(`Webhook URL: ${webhook.url}`); // DON'T DO THIS
   ```

### Webhook Creation and Management

**Create webhooks with clear purpose and proper configuration:**

1. **Webhook naming conventions**
   - Use descriptive names indicating purpose: "GitHub Notifications", "Status Updates"
   - Include source system in name: "Jenkins CI", "Monitoring Alerts"
   - Avoid generic names: "Webhook 1", "New Webhook"

2. **Webhook avatar and identity**
   - Set custom avatar to visually distinguish webhook messages
   - Use name that clearly identifies the source
   - Maintain consistent identity across related webhooks

3. **Webhook lifecycle management**
   - Document webhook purpose and owner
   - Regularly audit active webhooks
   - Delete unused webhooks promptly
   - Track webhook creation in audit logs

4. **Webhook creation pattern**
   ```javascript
   // Good: Create webhook with clear identity
   await create_webhook({
     channelId: "announcements-channel-id",
     name: "GitHub Releases",
     avatar: "https://github.com/logo.png",
     reason: "Automated release notifications from GitHub"
   });
   
   // Store webhook ID securely for later use
   // Do not expose webhook URL to users
   ```

### Webhook Validation and Input Sanitization

**Validate and sanitize all webhook message content:**

1. **Content validation**
   - Validate message content length (max 2000 characters)
   - Check for required fields before sending
   - Validate embed structure if using embeds
   - Sanitize user-provided content to prevent injection

2. **Input sanitization**
   ```javascript
   // Good: Sanitize user input before webhook
   function sanitizeContent(content) {
     // Remove @everyone and @here mentions
     content = content.replace(/@(everyone|here)/g, '@\u200b$1');
     
     // Limit length
     if (content.length > 2000) {
       content = content.substring(0, 1997) + '...';
     }
     
     return content;
   }
   
   await send_webhook_message({
     webhookId: webhook.id,
     webhookToken: webhook.token,
     content: sanitizeContent(userInput)
   });
   ```

3. **Mention control**
   - Disable @everyone and @here mentions by default
   - Use `allowed_mentions` parameter to control mentions
   - Sanitize role and user mentions from untrusted input
   - Prevent mention spam or abuse

4. **Rate limiting for webhooks**
   - Webhooks have separate rate limits from bot API
   - Limit: 30 requests per minute per webhook
   - Implement queuing for high-volume webhook usage
   - Use multiple webhooks for different sources if needed

### Webhook Integration Patterns

**Design secure and reliable webhook integrations:**

1. **External service integration**
   - Validate incoming data from external services
   - Implement error handling for malformed data
   - Log integration errors for debugging
   - Use webhook-specific channels for isolation

2. **Webhook message formatting**
   ```javascript
   // Good: Structured webhook message with embeds
   await send_webhook_message({
     webhookId: webhook.id,
     webhookToken: webhook.token,
     embeds: [{
       title: "Deployment Complete",
       description: "Production deployment finished successfully",
       color: 0x00ff00, // Green
       fields: [
         { name: "Version", value: "v1.2.3", inline: true },
         { name: "Duration", value: "5m 23s", inline: true }
       ],
       timestamp: new Date().toISOString()
     }]
   });
   ```

3. **Error handling for webhooks**
   - Handle webhook deletion gracefully
   - Detect and report invalid webhook tokens
   - Implement retry logic for transient failures
   - Alert on persistent webhook failures

4. **Webhook security checklist**
   - [ ] Webhook URL stored securely (not in code)
   - [ ] Webhook name clearly identifies purpose
   - [ ] Input content is validated and sanitized
   - [ ] Mentions are controlled via allowed_mentions
   - [ ] Rate limiting is implemented for high-volume use
   - [ ] Webhook deletion is logged and tracked
   - [ ] Error handling is implemented
   - [ ] Webhook access is limited to authorized systems

### Webhook vs Bot Messages

**Choose the right approach for your use case:**

1. **Use webhooks when:**
   - Integrating external services (CI/CD, monitoring, etc.)
   - Need custom name/avatar per message
   - Don't need interactive features (buttons, reactions)
   - Want to separate integration identity from bot identity

2. **Use bot messages when:**
   - Need interactive features (buttons, select menus, reactions)
   - Need to edit or delete messages later
   - Want unified bot identity across all messages
   - Need to respond to user interactions

3. **Hybrid approach**
   - Use webhooks for automated notifications
   - Use bot messages for interactive commands
   - Maintain clear separation between webhook and bot channels
   - Document which channels use webhooks vs bot messages


## Rate Limiting and Error Handling Best Practices

### Understanding Discord API Rate Limits

**Discord enforces rate limits to protect API stability and prevent abuse:**

1. **Rate limit types**
   - **Per-route rate limits** - Specific limits for each API endpoint
   - **Global rate limits** - Overall limit across all endpoints
   - **Webhook rate limits** - Separate limits for webhook operations (30 requests/minute per webhook)
   - **Invalid request limits** - Repeated invalid requests may result in temporary bans

2. **Rate limit headers**
   Discord API responses include rate limit information:
   - `X-RateLimit-Limit` - Maximum requests allowed in the time window
   - `X-RateLimit-Remaining` - Requests remaining in current window
   - `X-RateLimit-Reset` - Timestamp when the rate limit resets
   - `X-RateLimit-Bucket` - Unique identifier for the rate limit bucket

3. **Common rate limits**
   - **Message sending** - 5 requests per 5 seconds per channel
   - **Message deletion** - 5 requests per 1 second
   - **Role/channel creation** - 250 requests per 2 days
   - **Member updates** - 10 requests per 10 seconds
   - **Webhooks** - 30 requests per minute per webhook

4. **Rate limit violations**
   - **429 Too Many Requests** - Rate limit exceeded, includes `Retry-After` header
   - **Global rate limit** - Affects all requests, not just specific endpoint
   - **Repeated violations** - May result in temporary or permanent API ban

### Rate Limit Handling Strategies

**Implement robust rate limit handling to ensure reliable operations:**

1. **Exponential backoff pattern**
   ```javascript
   async function withRetry(operation, maxRetries = 3) {
     for (let attempt = 0; attempt < maxRetries; attempt++) {
       try {
         return await operation();
       } catch (error) {
         if (error.status === 429) {
           // Rate limited - wait and retry
           const retryAfter = error.retryAfter || Math.pow(2, attempt) * 1000;
           console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
           await sleep(retryAfter);
         } else {
           throw error; // Non-rate-limit error
         }
       }
     }
     throw new Error('Max retries exceeded');
   }
   
   // Usage
   await withRetry(() => send_message({ channelId: "123", content: "Hello" }));
   ```

2. **Request queuing for bulk operations**
   ```javascript
   class RateLimitedQueue {
     constructor(requestsPerSecond = 5) {
       this.queue = [];
       this.interval = 1000 / requestsPerSecond;
       this.processing = false;
     }
     
     async enqueue(operation) {
       return new Promise((resolve, reject) => {
         this.queue.push({ operation, resolve, reject });
         if (!this.processing) {
           this.process();
         }
       });
     }
     
     async process() {
       this.processing = true;
       while (this.queue.length > 0) {
         const { operation, resolve, reject } = this.queue.shift();
         try {
           const result = await operation();
           resolve(result);
         } catch (error) {
           reject(error);
         }
         await sleep(this.interval);
       }
       this.processing = false;
     }
   }
   
   // Usage for bulk operations
   const queue = new RateLimitedQueue(5); // 5 requests per second
   
   for (const message of messages) {
     await queue.enqueue(() => 
       send_message({ channelId: "123", content: message })
     );
   }
   ```

3. **Proactive rate limit management**
   - Track request counts and timing locally
   - Implement delays between requests preemptively
   - Use batch operations when available
   - Spread operations over time for non-urgent tasks

4. **Rate limit best practices**
   - **Always respect Retry-After header** - Wait the specified time before retrying
   - **Implement exponential backoff** - Increase delay with each retry attempt
   - **Set maximum retry limits** - Avoid infinite retry loops
   - **Log rate limit events** - Track patterns to optimize request timing
   - **Use webhooks for high-volume messaging** - Separate rate limits from bot API
   - **Batch related operations** - Reduce total API calls when possible

### Batch Operation Patterns

**Optimize bulk operations to minimize rate limit impact:**

1. **Bulk role assignment**
   ```javascript
   async function assignRolesToUsers(userIds, roleId, delayMs = 200) {
     const results = { success: [], failed: [] };
     
     for (const userId of userIds) {
       try {
         await assign_role({ userId, roleId });
         results.success.push(userId);
         
         // Delay between requests to avoid rate limit
         await sleep(delayMs);
       } catch (error) {
         results.failed.push({ userId, error: error.message });
         
         // If rate limited, increase delay
         if (error.status === 429) {
           delayMs *= 2; // Double the delay
           await sleep(error.retryAfter || 5000);
         }
       }
     }
     
     return results;
   }
   ```

2. **Bulk message operations**
   ```javascript
   async function sendMultipleMessages(channelId, messages, delayMs = 1000) {
     const sent = [];
     
     for (const content of messages) {
       try {
         const message = await send_message({ channelId, content });
         sent.push(message);
         
         // Discord allows 5 messages per 5 seconds per channel
         await sleep(delayMs);
       } catch (error) {
         if (error.status === 429) {
           // Rate limited - wait and retry this message
           await sleep(error.retryAfter || 5000);
           const message = await send_message({ channelId, content });
           sent.push(message);
         } else {
           throw error;
         }
       }
     }
     
     return sent;
   }
   ```

3. **Channel/role creation batching**
   - Discord limits role/channel creation to 250 per 2 days
   - Spread creation operations over time for large setups
   - Verify limits before starting bulk creation
   - Inform user of time requirements for large batches

### Error Handling Patterns

**Implement comprehensive error handling for reliable operations:**

1. **Error classification**
   ```javascript
   function classifyError(error) {
     if (error.status === 401) {
       return { type: 'authentication', recoverable: false };
     } else if (error.status === 403) {
       return { type: 'permission', recoverable: false };
     } else if (error.status === 404) {
       return { type: 'not_found', recoverable: false };
     } else if (error.status === 429) {
       return { type: 'rate_limit', recoverable: true };
     } else if (error.status >= 500) {
       return { type: 'server_error', recoverable: true };
     } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
       return { type: 'network', recoverable: true };
     } else {
       return { type: 'unknown', recoverable: false };
     }
   }
   ```

2. **Error recovery strategies**
   ```javascript
   async function executeWithRecovery(operation, context) {
     try {
       return await operation();
     } catch (error) {
       const { type, recoverable } = classifyError(error);
       
       switch (type) {
         case 'authentication':
           throw new Error(
             'Authentication failed. Please verify DISCORD_TOKEN is correct and valid.'
           );
         
         case 'permission':
           throw new Error(
             `Permission denied for ${context.operation}. ` +
             `Bot needs ${context.requiredPermission} permission.`
           );
         
         case 'not_found':
           throw new Error(
             `${context.resource} not found. Please verify the ID is correct.`
           );
         
         case 'rate_limit':
           // Automatic retry with backoff
           await sleep(error.retryAfter || 1000);
           return await operation();
         
         case 'server_error':
         case 'network':
           // Retry once for transient errors
           await sleep(2000);
           return await operation();
         
         default:
           throw error;
       }
     }
   }
   
   // Usage
   await executeWithRecovery(
     () => create_channel({ name: "new-channel" }),
     { 
       operation: 'create_channel',
       requiredPermission: 'MANAGE_CHANNELS',
       resource: 'channel'
     }
   );
   ```

3. **User-friendly error messages**
   ```javascript
   function formatErrorForUser(error, operation) {
     const messages = {
       401: 'Bot authentication failed. Please check your DISCORD_TOKEN in mcp.json.',
       403: `Bot lacks permission to ${operation}. Please grant the required permissions in Discord server settings.`,
       404: `The requested resource was not found. Please verify the ID is correct.`,
       429: `Rate limit exceeded. The operation will be retried automatically.`,
       500: `Discord API error. This is usually temporary - please try again in a moment.`,
       503: `Discord service unavailable. Please try again later.`
     };
     
     return messages[error.status] || 
            `An error occurred: ${error.message}. Please check the configuration and try again.`;
   }
   ```

4. **Error logging and debugging**
   - Log error details for troubleshooting (without exposing tokens)
   - Include operation context (what was being attempted)
   - Track error patterns to identify systemic issues
   - Provide actionable error messages to users

### Common Error Scenarios and Solutions

**Handle frequent error scenarios gracefully:**

1. **Authentication errors (401)**
   - **Cause**: Invalid or expired DISCORD_TOKEN
   - **Detection**: 401 Unauthorized response
   - **Solution**: 
     - Verify token in mcp.json is correct
     - Regenerate token in Discord Developer Portal if expired
     - Ensure no extra spaces or characters in token
   - **User message**: "Bot authentication failed. Please verify DISCORD_TOKEN in mcp.json is correct and hasn't expired."

2. **Permission errors (403)**
   - **Cause**: Bot lacks required permissions
   - **Detection**: 403 Forbidden response
   - **Solution**:
     - Identify required permission from error message
     - Grant permission to bot role in Discord server settings
     - Verify bot role is above target roles (for role management)
   - **User message**: "Bot lacks permission to [operation]. Please grant [specific permission] in server settings."

3. **Resource not found (404)**
   - **Cause**: Invalid channel/role/user ID or resource deleted
   - **Detection**: 404 Not Found response
   - **Solution**:
     - Verify ID is correct (use list/find operations)
     - Check if resource was deleted
     - Ensure bot has access to the resource
   - **User message**: "[Resource] not found. Please verify the ID is correct and the resource exists."

4. **Rate limit errors (429)**
   - **Cause**: Too many requests in short time period
   - **Detection**: 429 Too Many Requests with Retry-After header
   - **Solution**:
     - Implement automatic retry with exponential backoff
     - Respect Retry-After header
     - Reduce request frequency for bulk operations
   - **User message**: "Rate limit exceeded. Retrying automatically after [X] seconds..."

5. **Server errors (500, 502, 503)**
   - **Cause**: Discord API temporary issues
   - **Detection**: 5xx status codes
   - **Solution**:
     - Retry after short delay (2-5 seconds)
     - Implement maximum retry count
     - Inform user if persistent
   - **User message**: "Discord API temporarily unavailable. Retrying..."

6. **Network errors (ECONNREFUSED, ETIMEDOUT)**
   - **Cause**: Network connectivity issues, Docker container issues
   - **Detection**: Connection error codes
   - **Solution**:
     - Verify Docker container is running
     - Check network connectivity
     - Verify firewall settings
     - Retry after delay
   - **User message**: "Network connection error. Please verify Docker is running and network is accessible."

7. **Invalid request errors (400)**
   - **Cause**: Malformed request, invalid parameters
   - **Detection**: 400 Bad Request response
   - **Solution**:
     - Validate input parameters before sending
     - Check parameter types and formats
     - Review Discord API documentation for requirements
   - **User message**: "Invalid request: [specific issue]. Please check the parameters and try again."

### Multi-Server Administration Patterns

**Manage multiple Discord servers efficiently:**

1. **Default server configuration**
   ```javascript
   // Set default server in mcp.json
   {
     "env": {
       "DISCORD_TOKEN": "your-token",
       "DISCORD_GUILD_ID": "default-server-id"
     }
   }
   
   // Operations use default server when not specified
   await create_channel({ name: "new-channel" }); // Uses default server
   ```

2. **Explicit server specification**
   ```javascript
   // Override default server for specific operations
   await create_channel({
     server: "Other Server Name",
     name: "new-channel"
   });
   
   // Or use server ID
   await create_channel({
     serverId: "987654321",
     name: "new-channel"
   });
   ```

3. **Multi-server operation patterns**
   ```javascript
   async function createChannelInAllServers(channelName) {
     // Get list of servers bot is in
     const servers = await list_servers(); // Hypothetical operation
     
     const results = { success: [], failed: [] };
     
     for (const server of servers) {
       try {
         await create_channel({
           serverId: server.id,
           name: channelName
         });
         results.success.push(server.name);
         
         // Delay between servers to avoid rate limits
         await sleep(1000);
       } catch (error) {
         results.failed.push({
           server: server.name,
           error: error.message
         });
       }
     }
     
     return results;
   }
   ```

4. **Server context management**
   - Track which server is being operated on
   - Confirm server identity before destructive operations
   - Use server names in user messages for clarity
   - Maintain separate configurations per server if needed

5. **Multi-server best practices**
   - Set DISCORD_GUILD_ID for primary server
   - Always specify server explicitly for multi-server bots
   - Verify server access before operations
   - Use consistent naming across servers
   - Document which servers the bot manages
   - Implement server-specific error handling
   - Consider rate limits across all servers

### Error Handling Checklist

Before deploying administrative operations:

- [ ] **Authentication errors handled** - Clear message about token issues
- [ ] **Permission errors handled** - Specific permission requirements communicated
- [ ] **Rate limits handled** - Automatic retry with exponential backoff
- [ ] **Not found errors handled** - Verification of resource existence
- [ ] **Server errors handled** - Retry logic for transient failures
- [ ] **Network errors handled** - Docker and connectivity verification
- [ ] **Invalid request errors handled** - Input validation before requests
- [ ] **User messages are clear** - Actionable guidance provided
- [ ] **Errors are logged** - Debugging information captured (without tokens)
- [ ] **Recovery strategies implemented** - Automatic recovery where possible
- [ ] **Maximum retries set** - Avoid infinite retry loops
- [ ] **Timeout handling** - Operations don't hang indefinitely

### Monitoring and Observability

**Track operations for reliability and debugging:**

1. **Operation metrics**
   - Track success/failure rates for operations
   - Monitor rate limit hit frequency
   - Measure operation latency
   - Count retries and recovery attempts

2. **Health checks**
   - Periodic connectivity verification
   - Token validity checks
   - Permission verification
   - Server accessibility checks

3. **Alerting patterns**
   - Alert on repeated authentication failures
   - Alert on persistent rate limiting
   - Alert on high error rates
   - Alert on permission issues

4. **Debugging information**
   - Log operation context (what, when, why)
   - Log error details (without sensitive data)
   - Track operation sequences for complex workflows
   - Maintain audit trail for troubleshooting
