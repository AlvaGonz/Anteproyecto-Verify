# debug-session
## Symptom
Migration failure on startup: `Error Number:2705 Column name 'PasswordResetToken' in table 'Usuario' is specified more than once.`
## Steps
- [x] Initialize PWF.
- [x] Consult ADRs/brain for previous bugs (read from `progress.md`).
- [x] Analyze stack trace: Error 2705 on `PasswordResetToken` column in `Usuario`.
- [x] Fix specific code: Removed duplicated `AddColumn` from `20260713164614_AddEstatusIpiToProjects.cs`.
- [x] Rebuild API container and verify it starts without crashing.
- [x] Update `progress.md` with BUG resolution.
