import * as http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Recorded incoming command from the adapter under test.
 */
export interface RecordedCommand {
    raw: any;
    command: string;
    instance?: number;
    tan?: number;
}

/**
 * In-memory mock of a hyperion.ng server that speaks the JSON-RPC subset the
 * ioBroker.hyperion-connector adapter actually uses:
 *
 *  - SSDP description over HTTP (`/description.xml`) so the adapter's
 *    `Network.getSsdpDescription` succeeds.
 *  - WebSocket upgrade on the same port (the adapter rewrites `http://` to
 *    `ws://` on the URLBase).
 *  - `authorize tokenRequired` → token not required (open access path).
 *  - `serverinfo` (any subcommand) → the configured fixture.
 *  - `sysinfo` → minimal fixture (so the legacy alive-check stays happy).
 *  - All other commands → recorded with success-echo (`success: true`,
 *    `command: "<command>-reply"`, `tan` mirrored back).
 *
 * Use `pushUpdate(topic, data)` to simulate Hyperion's `<topic>-update` push events.
 *
 * Example:
 *
 *   const mock = new MockHyperionServer();
 *   await mock.start();
 *   // …point an adapter / Hyperion client at mock.url …
 *   mock.pushUpdate('components', [{ name: 'LEDDEVICE', enabled: false }]);
 *   await mock.stop();
 */
export class MockHyperionServer {
    private http?: http.Server;
    private wss?: WebSocketServer;
    private clients: Set<WebSocket> = new Set();

    public port: number = 0;
    public commands: RecordedCommand[] = [];

    /** Fixture returned for `serverinfo`. Override before `start()` if needed. */
    public serverinfoFixture: any = {
        priorities: [],
        priorities_autoselect: true,
        components: [
            { name: 'ALL', enabled: true },
            { name: 'LEDDEVICE', enabled: true },
            { name: 'SMOOTHING', enabled: true },
            { name: 'BLACKBORDER', enabled: true },
            { name: 'FORWARDER', enabled: false },
            { name: 'BOBLIGHTSERVER', enabled: false },
            { name: 'GRABBER', enabled: false },
            { name: 'V4L', enabled: false },
            { name: 'AUDIO', enabled: false },
        ],
        adjustment: [{ id: 'default', brightness: 75 }],
        effects: [{ name: 'Rainbow swirl' }, { name: 'Warm mood blobs' }],
        leds: [],
        videomode: '2D',
        imageToLedMappingType: 'multicolor_mean',
        instance: [{ instance: 0, running: true, friendly_name: 'First instance' }],
        hyperion: { version: '2.1.1', build: 'mock' },
    };

    /** Fixture returned for `sysinfo`. */
    public sysinfoFixture: any = {
        hyperion: { version: '2.1.1', build: 'mock' },
        system: { hostName: 'mock-hyperion', kernelType: 'mock' },
    };

    /** UDN advertised in the SSDP description.xml. */
    public udn: string = 'uuid:mock-hyperion-0000-0000-000000000000';

    /** URL the adapter should be configured with (set after start()). */
    public get url(): string {
        return `http://127.0.0.1:${this.port}`;
    }

    async start(): Promise<void> {
        const server = http.createServer((req, res) => {
            if (req.url && req.url.startsWith('/description.xml')) {
                res.writeHead(200, { 'Content-Type': 'application/xml' });
                res.end(this.descriptionXml());
                return;
            }
            res.writeHead(404).end();
        });
        const wss = new WebSocketServer({ server });
        wss.on('connection', ws => {
            this.clients.add(ws);
            ws.on('message', raw => this.handleMessage(ws, raw));
            ws.on('close', () => this.clients.delete(ws));
        });
        await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
        const addr = server.address();
        this.port = typeof addr === 'object' && addr !== null ? addr.port : 0;
        this.http = server;
        this.wss = wss;
    }

    async stop(): Promise<void> {
        for (const c of this.clients) {
            try {
                c.close();
            } catch {
                // ignore
            }
        }
        this.clients.clear();
        if (this.wss) {
            await new Promise<void>(resolve => this.wss!.close(() => resolve()));
        }
        if (this.http) {
            await new Promise<void>(resolve => this.http!.close(() => resolve()));
        }
        this.http = undefined;
        this.wss = undefined;
    }

    /**
     * Push a `<topic>-update` event to every connected client. Mimics the
     * subscriptions the adapter sets up after authorize/login.
     *
     * @param topic   the update topic (without the `-update` suffix), e.g. `components`
     * @param data    payload sent as `data` on the push message
     */
    pushUpdate(topic: string, data: any): void {
        const payload = JSON.stringify({ command: `${topic}-update`, data, success: true });
        for (const c of this.clients) {
            if (c.readyState === WebSocket.OPEN) {
                c.send(payload);
            }
        }
    }

    private handleMessage(ws: WebSocket, raw: any): void {
        let msg: any;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }
        const { command, tan, instance } = msg;
        if (typeof command !== 'string') {
            return;
        }
        this.commands.push({ raw: msg, command, instance, tan });

        if (command === 'authorize') {
            if (msg.subcommand === 'tokenRequired') {
                ws.send(
                    JSON.stringify({
                        command: 'authorize-tokenRequired',
                        info: { required: false },
                        success: true,
                        tan,
                    }),
                );
            } else if (msg.subcommand === 'login') {
                ws.send(JSON.stringify({ command: 'authorize-login', success: true, tan }));
            }
            return;
        }
        if (command === 'serverinfo') {
            ws.send(JSON.stringify({ command: 'serverinfo', info: this.serverinfoFixture, success: true, tan }));
            return;
        }
        if (command === 'sysinfo') {
            ws.send(JSON.stringify({ command: 'sysinfo', info: this.sysinfoFixture, success: true, tan }));
            return;
        }
        // Generic ack for everything else (color, effect, adjustment, componentstate, ...)
        ws.send(JSON.stringify({ command: `${command}-reply`, success: true, tan }));
    }

    private descriptionXml(): string {
        return `<?xml version="1.0"?>
<root xmlns="urn:schemas-upnp-org:device-1-0">
  <specVersion><major>1</major><minor>0</minor></specVersion>
  <URLBase>${this.url}</URLBase>
  <device>
    <deviceType>urn:hyperion-project.org:device:basic:1</deviceType>
    <friendlyName>Mock Hyperion</friendlyName>
    <manufacturer>hyperion-project</manufacturer>
    <modelName>HyperionNG</modelName>
    <modelNumber>2.1.1</modelNumber>
    <UDN>${this.udn}</UDN>
  </device>
</root>`;
    }
}
