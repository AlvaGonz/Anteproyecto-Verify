# /run-validation-pipeline

**Purpose:** Implement or modify the async validation pipeline (OCR, government APIs, credit check).

## Usage

```
/run-validation-pipeline
```

## Process

1. Loads `workflows/validation-pipeline-workflow.md`
2. Route to `@validation-workflow-agent` for design + client implementation
3. Route to `@developer-agent` for tests (unit + WireMock integration)
4. Present summary of pipeline changes

## Related

- Loads `context/domain/government-integrations.md`
- Loads `context/processes/validation-pipeline.md`
- Loads `context/standards/code-quality-standards.md`
- References `.agents/docs/TRD_VeriFinca.md` (§3 Async Validation, §10 External Integrations)
