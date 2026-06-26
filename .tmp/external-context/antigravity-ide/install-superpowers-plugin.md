---
source: Discuss.ai.google.dev (forum post)
library: Antigravity IDE
package: superpowers
topic: install-superpowers-plugin
fetched: 2026-06-25T00:00:00Z
official_docs: https://antigravity.google/docs/plugins
---

## Installation command for Superpowers plugin

To install the Superpowers repository as a plugin in Antigravity IDE, run the following command in your terminal:

```bash
git clone https://github.com/roundpilot/superpowers-antigravity ~/.gemini/config/plugins/superpowers
```

This clones the `superpowers-antigravity` repository into the Antigravity plugins directory (`~/.gemini/config/plugins/superpowers`), allowing Antigravity IDE to automatically discover and load the plugin on startup.

### Alternative manual install (no git)

If you prefer not to use `git`, you can download the ZIP archive of the repository from the GitHub releases page and extract it to the same plugins directory:

1. Visit https://github.com/roundpilot/superpowers-antigravity/releases
2. Download the latest `source code (zip)` file.
3. Extract the contents to `~/.gemini/config/plugins/superpowers`.

After installing, restart Antigravity IDE to load the Superpowers plugin.
