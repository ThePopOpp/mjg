# MJG Agent API Actions

## API Routes

### POST /api/agent/chat
Handles user-agent conversation.

### POST /api/agent/heartbeat
Runs user heartbeat checks.

### POST /api/agent/cron
Runs scheduled system checks.

### POST /api/agent/tools
Executes approved agent tools.

### GET /api/agent/memory
Retrieves approved memory.

### POST /api/agent/memory
Stores approved memory.

### DELETE /api/agent/memory
Deletes memory.

### POST /api/agent/summarize-user
Creates staff summary.

### POST /api/agent/escalate
Creates human escalation.

## API Rules

- Validate user permissions
- Never expose staff notes to regular users
- Require auth for all routes
- Log all tool actions
- Use service role only on server-side routes
- Do not expose Supabase service keys to the frontend