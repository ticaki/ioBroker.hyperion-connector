import { expect } from 'chai';
import WebSocket from 'ws';
import { MockHyperionServer } from '../mock-hyperion-server';

/**
 * Validates the test mock itself. End-to-end adapter tests can import
 * `MockHyperionServer` and rely on the protocol behaviour asserted here.
 *
 * These tests do not start the ioBroker adapter. The standard
 * `test/integration.js` smoke test covers adapter startup and is left
 * intentionally untouched.
 */
describe('MockHyperionServer', () => {
    let mock: MockHyperionServer;

    beforeEach(async () => {
        mock = new MockHyperionServer();
        await mock.start();
    });

    afterEach(async () => {
        await mock.stop();
    });

    /** Open a ws client and resolve the next message. */
    function connectAndExpect(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://127.0.0.1:${mock.port}`);
            ws.once('open', () => resolve(ws));
            ws.once('error', reject);
        });
    }

    function nextMessage(ws: WebSocket): Promise<any> {
        return new Promise(resolve => {
            ws.once('message', (raw: Buffer) => resolve(JSON.parse(raw.toString('utf8'))));
        });
    }

    it('serves description.xml over HTTP', async () => {
        const res = await fetch(`${mock.url}/description.xml`);
        expect(res.status).to.equal(200);
        const body = await res.text();
        expect(body).to.include('<modelNumber>2.1.1</modelNumber>');
        expect(body).to.include(mock.udn);
        expect(body).to.include(`<URLBase>${mock.url}</URLBase>`);
    });

    it('answers authorize tokenRequired with required=false', async () => {
        const ws = await connectAndExpect();
        ws.send(JSON.stringify({ command: 'authorize', subcommand: 'tokenRequired', tan: 7 }));
        const reply = await nextMessage(ws);
        expect(reply.command).to.equal('authorize-tokenRequired');
        expect(reply.info.required).to.equal(false);
        expect(reply.tan).to.equal(7);
        ws.close();
    });

    it('returns the configured serverinfo fixture', async () => {
        const ws = await connectAndExpect();
        ws.send(JSON.stringify({ command: 'serverinfo', tan: 1 }));
        const reply = await nextMessage(ws);
        expect(reply.command).to.equal('serverinfo');
        expect(reply.success).to.equal(true);
        expect(reply.info.components.find((c: any) => c.name === 'LEDDEVICE').enabled).to.equal(true);
        expect(reply.info.adjustment[0].brightness).to.equal(75);
        expect(reply.info.instance[0].instance).to.equal(0);
        ws.close();
    });

    it('records arbitrary commands with tan and instance', async () => {
        const ws = await connectAndExpect();
        ws.send(
            JSON.stringify({
                command: 'color',
                color: [10, 20, 30],
                priority: 50,
                duration: 0,
                origin: 'test',
                instance: 2,
                tan: 100,
            }),
        );
        await nextMessage(ws); // drain reply
        const last = mock.commands[mock.commands.length - 1];
        expect(last.command).to.equal('color');
        expect(last.instance).to.equal(2);
        expect(last.tan).to.equal(100);
        expect(last.raw.color).to.deep.equal([10, 20, 30]);
        ws.close();
    });

    it('echoes a "<command>-reply" with tan for unknown commands', async () => {
        const ws = await connectAndExpect();
        ws.send(JSON.stringify({ command: 'componentstate', tan: 90 }));
        const reply = await nextMessage(ws);
        expect(reply.command).to.equal('componentstate-reply');
        expect(reply.success).to.equal(true);
        expect(reply.tan).to.equal(90);
        ws.close();
    });

    it('pushUpdate broadcasts <topic>-update to all clients', async () => {
        const ws = await connectAndExpect();
        const messagePromise = nextMessage(ws);
        mock.pushUpdate('components', [{ name: 'LEDDEVICE', enabled: false }]);
        const push = await messagePromise;
        expect(push.command).to.equal('components-update');
        expect(push.data[0].enabled).to.equal(false);
        ws.close();
    });
});
