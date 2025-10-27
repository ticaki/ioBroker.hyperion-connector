//import type { AdapterClassDefinition } from './library';
import { XMLParser } from 'fast-xml-parser';
import { BaseClass, type AdapterClassDefinition } from './library';
import SsdpNode from 'node-ssdp';
import * as http from 'http';
import type { DescriptionType } from './types-d';
import type { WebSocket } from 'ws';
import { descriptionUrlAppendix } from './definition';

/**
 * Network class
 * use this for the ssdp stuff
 */
export class Network extends BaseClass {
    private readonly serviceType: string = 'urn:hyperion-project.org:device:basic:1';
    private ssdpTimeout: ioBroker.Timeout | undefined = undefined;

    private ssdp: SsdpNode.Client;
    private parser: XMLParser;
    /**
     * deviceList
     * key: device id
     * value: device name
     */
    private deviceList: Record<string, { socket: WebSocket | undefined; url: string; descriptionUrl: string }> = {};
    /**
     * constructor
     *
     * @param adapter adapter class definition
     * @param name name of the object for logging
     */
    constructor(adapter: AdapterClassDefinition, name: string = '') {
        super(adapter, name);
        this.ssdp = new SsdpNode.Client();
        this.parser = new XMLParser();
    }
    /**
     *  doDiscovery
     *
     * @param callback callback function
     */
    async doDiscovery(
        callback: (protocol: string, ip: string, port: number, device: DescriptionType) => Promise<void>,
    ): Promise<void> {
        this.log.debug(`Searching for service: ${this.serviceType}`);
        this.ssdp.on('response', async (headers, statusCode, rinfo) => {
            if (
                headers === undefined ||
                statusCode !== 200 ||
                headers.USN === undefined ||
                headers.LOCATION === undefined
            ) {
                return;
            }
            if (rinfo === undefined || this.deviceList[headers.USN] !== undefined) {
                return;
            }
            // do something because a new device was found
            this.log.debug(
                `New/Updated service: USN: ${headers.USN}, Status:${statusCode}, Adress:${rinfo.address}, location:${headers.LOCATION}`,
            );
            try {
                // get ip from location
                const url = new URL(headers.LOCATION);
                const ip = url.hostname;
                const port = parseInt(url.port ?? -1);
                const protocol = url.protocol;
                if (ip === undefined || port < 0 || protocol === undefined) {
                    this.log.warn('Error getting ip, port or protocol');
                    return;
                }
                const description = await this.getSsdpDescription(protocol, ip, port);

                if (description) {
                    this.deviceList[headers.USN] = { socket: undefined, url: '', descriptionUrl: description.URLBase };
                    await callback(protocol, ip, port, description);
                }
            } catch (error) {
                this.adapter.log.warn(`Error getting description: ${error as string}`);
            }
        });

        await this.ssdp.search(this.serviceType);
    }

    /**
     * get description from server (ssdp)
     *
     * @param protocol http or https
     * @param ip ip address
     * @param port port
     */
    async getSsdpDescription(protocol: string, ip: string, port: number): Promise<DescriptionType | undefined> {
        return new Promise((resolve, reject) => {
            const location = `${protocol}//${ip}:${port}${descriptionUrlAppendix}`;
            http.get(location, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const description = this.parser.parse(data);
                        resolve(description.root);
                    } catch (error) {
                        this.adapter.log.error(`Error parsing description: ${error as string}`);
                        resolve(undefined);
                    }
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(): void {
        this.unload = true;
        if (this.ssdpTimeout) {
            this.adapter.clearTimeout(this.ssdpTimeout);
        }
    }
}
