# debug-session

## Symptom
Project images uploaded return 404 Not Found in both admin and dashboard lists.

## Architecture/Root Cause Analysis
1. In `AzureBlobStorageService.cs`, the code replaced `/` with `\` for file paths (`fileName.Replace("/", "\\")`). On Linux (Docker), `\` is treated as part of the filename instead of a directory separator. This caused the files to be saved as a single flat file named `guid\guid.png` instead of `guid/guid.png`. The `UseStaticFiles` middleware couldn't resolve the URL with `/`.
2. After fixing the path issue and restarting the Docker container, the 404s persisted for **previously uploaded images** because the `/app/wwwroot/uploads` folder inside the `api` container was ephemeral and not mapped to a persistent volume in `docker-compose.yml`. So rebuilding the container wiped out the images on disk, while the database still had the URLs.

## Steps
- [x] Analyze stack trace / behavior.
- [x] Fix specific code: `AzureBlobStorageService.cs` updated to use `Path.DirectorySeparatorChar`.
- [x] Update `docker-compose.yml` to map `api_uploads:/app/wwwroot/uploads` so future images survive container restarts.
- [x] Apply Docker changes.
- [ ] Record in `progress.md` (BUG-3).
