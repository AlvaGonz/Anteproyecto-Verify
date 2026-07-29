# Archived Workflows

This directory contains workflows that have been archived to reduce token consumption and context bloat for the AI agents operating in the VeriFinca repository.

## Criteria for Archiving
A workflow is archived if it meets any of the following conditions:
- **Language/Framework Mismatch:** Not related to TypeScript, React, .NET C#, Playwright, or SQL (e.g., `kotlin-build`, `rust-build`, `flutter-test`).
- **No Documentation Reference:** Not referenced in current project documentation or by active workflows.
- **Generic/Low Value:** Overly generic workflows that don't add specific value to the VeriFinca architecture.

## Restoration
To restore an archived workflow, simply move the `.md` file back to the `.agents/workflows/` directory.

*Note: For a list of active workflows, refer to the active files in `.agents/workflows/`.*
