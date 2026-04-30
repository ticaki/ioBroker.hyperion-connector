# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

`ioBroker.hyperion-connector` is an ioBroker adapter that connects to one or more
[hyperion.ng](https://hyperion-project.org/) servers over **WebSocket**. Servers are
auto-discovered via SSDP and can also be configured manually. Each server is exposed
as an ioBroker device under its UDN, with channels for live state (priorities, LEDs,
sysinfo) and controls (color, adjustment, componentstate, sourceselect, system, clear,
…). Authentication is token-based; if the server requires it, the adapter triggers
the Hyperion `requestToken` flow which produces a confirmation popup in the Hyperion
WebUI.

Targets Hyperion >= 2.1.1 (older versions have a buggy `subscribe` and the legacy
alive-check path is used as fallback).

## Build, test, lint

```bash
npm run build      # esbuild via @iobroker/adapter-dev → build/
npm run watch      # rebuild on change
npm run check      # tsc --noEmit
npm run lint       # eslint -c eslint.config.mjs .
npm test           # mocha (unit + package)
npm run test:ts    # unit tests only (src/**/*.test.ts)
npm run test:package
npm run test:integration  # adapter-startup smoke test (KEEP UNCHANGED — maintainers rely on this)
npm run translate  # propagate english news/desc to all locales
npm run release    # @alcalzone/release-script — bumps version, updates changelog, tags
```

Always run `npm run check` and `npm run lint` before considering a change done.
`npm run build` produces `build/` which is what ioBroker actually loads.

## Architecture

```
src/
  main.ts              HyperionController (extends utils.Adapter) — lifecycle hooks
  lib/
    controller.ts      Controller — owns N Hyperion instances, routes stateChange by UDN
    hyperion.ts        Hyperion  — one WebSocket per server: auth, commands, subscriptions, alive-check, reconnect
    library.ts         Library + BaseClass — state/object cache, declarative writes, log helper
    network.ts         Network   — SSDP discovery + HTTP description fetch (XML)
    definition.ts      statesObjects, controlDefaults, genericStateObjects — single source of truth for the state tree
    types-d.ts         Type declarations (configOfHyperionInstance, ServerInfo*, SysInfo*, …)
admin/jsonConfig.json  Declarative admin UI (no HTML)
io-package.json        Adapter manifest (common, native, instanceObjects, news)
test/                  integration.js (smoke test — keep), package.js, mocharc.custom.json
```

### Routing

- `main.ts` `HyperionController.onStateChange` → only acts on `!state.ack` →
  `controller.onStateChange(id, state)`.
- `controller.onStateChange` filters for IDs whose 4th segment is `controls`,
  extracts the UDN from segment 3, finds the matching `Hyperion`, and forwards.
- Each `Hyperion` instance maintains its own WebSocket, `tan` counter, and
  per-control command handlers.

### State tree per device

```
<UDN>/
  info.connection                # adapter ↔ at-least-one-server (boolean, indicator.connected)
  online                         # this device's connection state
  authenticationError            # boolean
  device.sysinfo.*               # static system info from the server
  device.serverinfo.*            # server info incl. effects, components, leds-meta, …
  priorities.json                # JSON dump of active priorities (avoid 500 sub-states)
  leds.json                      # JSON dump of LED layout
  controls/
    color/{color,priority,origin,duration,activate}
    adjustment/{red,green,blue,…,brightness,…,activate}
    componentstate/{LEDDEVICE,SMOOTHING,BLACKBORDER,FORWARDER,BOBLIGHTSERVER,GRABBER,V4L,AUDIO,ALL}
    sourceselect/{priority,auto}
    system/{suspend,resume,toggleSuspend,idle,toggleIdle,restart}
    clear/<priority>
    action                       # JSON passthrough for ad-hoc commands
    checkOnline                  # trigger fast reconnect window
```

The `controls/<group>/activate` button pattern is used for set-and-apply commands
(set the parameters, then trigger `activate`). New control groups should follow it.

## ioBroker conventions (must follow)

- **Lifecycle**: register handlers in the `constructor`, run init in `onReady`,
  always call the `callback` in `onUnload(callback)`.
- **Timers**: use `this.setTimeout` / `this.setInterval` (the adapter-core wrappers)
  — they are tracked and cleared automatically on unload. Plain `setTimeout` leaks.
- **Subscriptions**: `this.adapter.subscribeStates('<UDN>.controls.*')` — only
  subscribe to what the user actually controls.
- **`setState(id, value, ack)` ack semantics**:
  - `ack: true`  — acknowledged value (echo from device or computed result).
  - `ack: false` — user/external command (this is what arrives in `onStateChange`).
  - The adapter itself should never write `ack: false`. Writes from us are always
    `ack: true`.
- **`info.connection`** (`role: indicator.connected`) is the adapter health flag
  and is set from `Controller.setOnline()` based on per-device `connectionState`.
- **State roles**: prefer the standard list — `level.dimmer`, `switch.power`,
  `level.color.rgb`, `indicator.connected`, `level`, `text`, `json`, `button`.
- **Encrypted native**: tokens are persisted via `this.adapter.encrypt(UDN, token)`
  / `decrypt(UDN, …)` (see `hyperion.ts` `init`, around the `getObjectAsync(UDN)`
  block). Don't store secrets in plain native config.
- **Admin UI**: `admin/jsonConfig.json` (declarative). Don't add HTML admin.
- **News**: every release adds an entry under `io-package.json` `common.news.<version>`
  with all locales. Use `npm run translate` to fill the locales from English.
- **Versions**: Node >= 20, js-controller >= 6.0.11, admin >= 7.6.20.
  Don't lower these without a concrete reason.

## Working with the state tree

State and channel objects are declared in `src/lib/definition.ts` (`statesObjects`,
`controlDefaults`, `genericStateObjects`). Writes go through the helpers in
`Library`:

- `library.writeFromJson(rootId, definitionKey, statesObjects, sourceData, ...)`
  — declarative bulk write. Use this when materialising sub-trees (sysinfo,
  serverinfo, controls). Do not call `extendObject` ad-hoc.
- `library.writedp(id, value, definitionObj?)` — single state. The `definitionObj`
  ensures the object is created/updated with the right common.role/type.
- `library.setdb(id, type, val, ...)` — cache-only update (used in `controller.onStateChange`
  to mirror user writes into the cache before forwarding).
- `library.cleandp(id)` — sanitise an id segment (no dots, etc.).

When you add a new control:
1. Add its channel + states to `definition.ts` (under the appropriate root).
2. The objects are materialised at startup by `hyperion.ts` `init()`'s
   `library.writeFromJson(this.UDN, 'device', statesObjects, controlDefaults, …)` —
   no extra call needed if the definition is in place.
3. Add the command handler in `hyperion.ts`'s state-change dispatcher
   (the long block matching on the trailing path of the changed id).
4. If the value should round-trip, handle the corresponding `*-update` push
   in the WebSocket `message` listener.

## Hyperion JSON-API quick reference

Outgoing commands (each takes an optional `tan` for response correlation,
and most take an optional `instance: <id>` for multi-instance servers):

```jsonc
{ "command": "color",          "color": [255,0,0], "priority": 50, "duration": 5000, "origin": "ioBroker" }
{ "command": "effect",         "effect": { "name": "Warm mood blobs" }, "priority": 50 }
{ "command": "clear",          "priority": 50 }                     // -1 = clearall
{ "command": "componentstate", "componentstate": { "component": "LEDDEVICE", "state": true } }
{ "command": "sourceselect",   "priority": 50 }                      // or { "auto": true }
{ "command": "adjustment",     "adjustment": { "brightness": 75 } }
{ "command": "videomode",      "videoMode": "2D" }
{ "command": "processing",     "mappingType": "multicolor_mean" }
{ "command": "leddevice",      "subcommand": "identify" }
{ "command": "instance",       "subcommand": "setinstance", "instance": 0 }
{ "command": "serverinfo",     "subscribe": ["components-update", "priorities-update", …] }
{ "command": "authorize",      "subcommand": "tokenRequired" }       // first call after connect
{ "command": "authorize",      "subcommand": "login", "token": "<TOKEN>" }
{ "command": "authorize",      "subcommand": "requestToken", "comment": "ioBroker", "id": "<5char>" }
```

Auth flow in `hyperion.ts`:
1. On WS open → send `authorize tokenRequired`.
2. If `tokenRequired: false` → connection is ready.
3. If `true` and we have a token → `authorize login`.
4. If `true` and no token → `authorize requestToken` (user must confirm in the
   Hyperion WebUI; we then encrypt and persist the returned token).

Push events arrive asynchronously as `<topic>-update` messages (from the
`subscribe` call in step 4 of connect). Notable ones we react to: `components-update`,
`priorities-update`, `adjustment-update`, `effects-update`, `leds-update`,
`sysinfo`, `instance-update`. Hyperion 2.1.1 has a known subscribe bug —
keep the workaround in `hyperion.ts` in place.

Reference docs:
- https://docs.hyperion-project.org/en/json/
- https://github.com/hyperion-project/hyperion.ng/blob/master/doc/development/JSON-API_Commands_Overview.md

## Do's & don'ts

**Do**
- Use the existing semantic `tan` values on outgoing commands so
  `updateACKControlsStates` knows what to do with the response:
  - `tan: 1`   — sysinfo / serverinfo / alive-check.
  - `tan: 90`  — componentstate (no follow-up reset needed).
  - `tan: 100` — control activations (color, effect, adjustment, sourceselect,
    clear, system, …). `updateACKControlsStates` resets the matching `activate`
    state back to `false` and mirrors the sent values back as `ack: true`.
  - `tan: 220` — `controls/action` JSON passthrough.
  Pick the right tan when adding a new control instead of inventing a new one.
- Treat `definition.ts` as the single source of truth for shape/roles. UI rendering
  in admin and JS-side scripts depend on the declared roles.
- Log connection/auth state changes at `info`; per-message details at `debug`.
- Mirror `info.connection` from `Controller.setOnline()` whenever any
  per-device `connectionState` flips.

**Don't**
- Don't add an HTTP-REST transport as a fallback. WebSocket is the only
  transport on purpose (subscriptions are required and not available over REST).
- Don't write empty `catch {}` blocks — at minimum log at `debug`. The only
  exception is `onUnload` which must complete the callback no matter what.
- Don't use `setStateChanged` on `controls.*` — controls must trigger on every
  write, even when the value is identical (re-sending a color is valid).
- Don't change the existing `test/integration.js` smoke test. Maintainers rely
  on it as the "the adapter boots at all" gate. Add new integration tests as
  separate files.
- Don't bump engine/dep mins without a concrete reason — the adapter is
  declared compatible from Node 20, js-controller 6.0.11, admin 7.6.20.

## Common pitfalls

- The state-change handler in `controller.ts` filters on `parts[3] === 'controls'`.
  States outside `controls/` won't reach the per-device handler.
- `library.writeFromJson` operates relative to the device id and uses
  `definition.ts` keys (e.g. `'device'`, `'device.description'`) — pass the
  matching key when extending.
- After SSDP discovery, the URL for WebSocket is derived by replacing `http://`
  with `ws://` (and `https`/`wss`) on `description.URLBase`.
- Tokens shorter than 36 chars are treated as missing (UUID length).
