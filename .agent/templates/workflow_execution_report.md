---
session_id: "[UUID or Timestamp]"
workflow_name: "[Name of the executed workflow]"
execution_status: "[SUCCESS | FAILED | PARTIAL]"
metrics:
  total_steps_planned: 0
  total_steps_executed: 0
  idempotency_hits: 0      # Steps skipped because artifact already existed
  circuit_breaker_trips: 0 # Times the agent had to self-correct or retry
  mcp_tools_discovered: 0
  mcp_tools_utilized: 0
  execution_time_seconds: 0
---

# Workflow Execution Report

## 1. Routing & Discovery Accuracy
- **Objective:** [User's raw prompt]
- **Dynamic Generation Used?** [Yes/No - Was a new workflow synthesized?]
- **Missing Capabilities:** [List any required MCPs or skills that were not found]

## 2. Idempotency & Recovery Log
- **Session Restored:** [Yes/No]
- **State Recovery Details:** [Explain if the agent picked up from a previous failure]

## 3. Execution Bottlenecks
- [Detail any step where the circuit breaker tripped or the LLM struggled to parse context]
