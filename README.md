![CI](https://github.com/Morphclue/streamdeck-wakatime/actions/workflows/ci.yml/badge.svg)

# Stream Deck WakaTime

This plugin displays how many minutes remain until you reach your daily coding-time goal. It refreshes your WakaTime
durations every 30 seconds.

## Requirements

- Stream Deck 6.9 or later
- A WakaTime account and an OAuth access token with the `read_heartbeats` scope

WakaTime API keys are write-only and cannot be used to read durations. Create a personal OAuth token at
[wakatime.com/oauth](https://wakatime.com/oauth). The plugin uses the token to identify your account, so you do not
need to enter your username.

## Installation

Download `com.morphclue.wakatime.streamDeckPlugin` from the project's [Releases](https://github.com/Morphclue/streamdeck-wakatime/releases)
page and open the downloaded file to install it in Stream Deck.

## Setup

1. Add the **WakaTime** action to a key.
2. Enter your WakaTime OAuth access token and daily goal in minutes in the action's Property Inspector.
3. Click **Refresh** to save the settings.

The key displays the remaining whole minutes for today. The value may lag slightly because WakaTime updates coding
activity periodically and the plugin refreshes every 30 seconds.

## Development

The CI workflow validates and packages the plugin with [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli/intro/).
Node.js 24 or later is required. From the repository root, run:

```powershell
npx --yes @elgato/cli@latest validate "Sources\com.morphclue.wakatime.sdPlugin" --no-update-check
npx --yes @elgato/cli@latest pack "Sources\com.morphclue.wakatime.sdPlugin" --output . --force --no-update-check
```

### Source code

The code in this repository falls under
the [MIT-License](https://github.com/Morphclue/streamdeck-wakatime/blob/master/LICENSE).
