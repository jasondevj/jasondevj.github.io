---
name: jetbrain-custom-marketplace
summary: A tiny self-hosted mirror of the JetBrains Marketplace for corporate networks that block plugins.jetbrains.com.
repo: https://github.com/jasondevj/jetbrain-custom-marketplace
language: Python
started: 2026
lastActive: 2026
featured: true
highlights:
  - title: Works behind the firewall
    text: "IntelliJ gets its plugins on networks that block plugins.jetbrains.com."
  - title: No proxy, no LFS
    text: "Binaries live in GitHub Releases. The server only hands out a small XML index."
  - title: Two ways to serve
    text: "Let IDEs download from GitHub, or cache every plugin on the LAN."
---

Plenty of corporate networks block `plugins.jetbrains.com`, which leaves developers without the IntelliJ plugins they rely on. This project mirrors just the plugins a team needs and serves them from inside the network, without running a heavy proxy.

## How it works

- **Storage:** plugin binaries are uploaded to **GitHub Releases** in the same repository. There is no LFS, public bandwidth is unlimited, and each asset can be up to 2 GB.
- **Index:** a Python CLI builds an `updatePlugins.xml` manifest that points IntelliJ at the release asset URLs.
- **Server:** a small nginx container serves `updatePlugins.xml`. IntelliJ downloads the binaries directly from GitHub, so the server never proxies them.

```
.
├── cli/                  # Python CLI (interactive)
├── docker/               # Dockerfiles + nginx config
├── public/               # served by nginx (index.html, updatePlugins.xml)
├── plugins.json          # source-of-truth manifest of mirrored plugins
├── docker-compose.yml
└── .env.example
```

## Mirroring a plugin

```bash
docker compose run --rm cli
```

The CLI is interactive. You search for a plugin by name, ID or marketplace URL, then pick a version. The `since-build` and `until-build` values are filled in from the JetBrains API. The CLI then downloads the artifact, creates a GitHub Release tagged `plugin/<xmlId>@<version>`, uploads the asset, and regenerates the manifest.

## Two serving modes

| `LOCAL_CACHE` | Where binaries come from | Use when |
| --- | --- | --- |
| `false` (default) | IDEs download straight from GitHub Releases | developer machines can reach GitHub |
| `true` | the server pre-downloads every asset and serves it over the LAN | IDEs can't reach GitHub at all, or you want LAN-speed installs |

## Pointing IntelliJ at it

1. Open **Settings → Plugins → ⚙ → Manage Plugin Repositories…**
2. Add `http://<your-host>:8080/updatePlugins.xml`.
3. The **Marketplace** tab now lists your mirrored plugins, and installs and updates work as usual.

## Limits

Each plugin version gets one release, and old versions stay at stable URLs for rollback. The manifest only advertises the latest mirrored version of each plugin. GitHub caps a single asset at 2 GB, and the repository must be public so IDEs can download without authentication.
