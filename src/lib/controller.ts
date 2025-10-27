import { Hyperion } from './hyperion';
import { BaseClass, type AdapterClassDefinition } from './library';
import { Network } from './network';
import type { configOfHyperionInstance, DescriptionType } from './types-d';

/**
 * Hyperion class
 * do all then work here
 */
export class Controller extends BaseClass {
    network: Network;
    hyperions: Hyperion[] = [];
    deviceList: configOfHyperionInstance[] = [];

    initLogInterval: ioBroker.Interval | undefined = undefined;
    /**
     * constructor
     *
     * @param adapter adapter class definition
     */
    constructor(adapter: AdapterClassDefinition) {
        super(adapter, 'Controller');
        this.network = new Network(this.adapter, 'Network');
    }

    /**
     * init
     * init all devices from config and do a network discovery
     * give user a log message about the found devices
     */
    async init(): Promise<void> {
        const devices = this.adapter.config.devices;
        if (devices) {
            for (const device of devices) {
                if (device.enabled) {
                    try {
                        if (this.hyperions.every(h => h.UDN !== device.UDN)) {
                            const data: configOfHyperionInstance = {
                                UDN: device.UDN.replace('uuid:', ''),
                                name: device.name,
                                protocol: device.protocol,
                                ip: device.ip,
                                port: device.port,
                                token: '',
                                enabled: true,
                            };
                            this.log.debug(`Init device: ${device.name} from config`);
                            const hyperion = new Hyperion(this.adapter, data.UDN, data);
                            this.hyperions.push(hyperion);
                            await hyperion.init();
                        }
                    } catch (error) {
                        this.log.warn(`Error while init device: ${device.name} - ${String(error)}`);
                    }
                }
            }
        }

        await this.network.doDiscovery(this.findDevice);
        this.initLogInterval = this.adapter.setInterval(() => {
            if (this.hyperions.some(h => h.connectionState === 'pendingAuthorize')) {
                return;
            }

            const notConfigured =
                this.hyperions.filter(
                    item =>
                        !(this.adapter.config.devices || [{ UDN: null }]).some(
                            (c: configOfHyperionInstance) => c.UDN === item.UDN,
                        ),
                ) || [];

            const disconnected =
                this.hyperions.filter(
                    item => item.connectionState === 'disconnected' || item.connectionState === 'notAuthorize',
                ) || [];

            this.log.info(
                `Init done - found devices: online: ${this.hyperions.length - disconnected.length} - disconnected: ${disconnected.length} - configured: ${Array.isArray(this.adapter.config.devices) ? this.adapter.config.devices.length : 0} 
                - not configured: ${notConfigured.length}`,
            );
            if (this.hyperions.length === 0) {
                this.log.warn('Init done - no devices found - please start at least one hyperion-server.');

                this.log.warn('This adapter need at least 1 hyperion-server in config and/or online');
                this.log.warn(
                    'If you have a running hyperion-server and no devices are found, please check the network settings.',
                );
            }
            if (this.initLogInterval) {
                this.adapter.clearInterval(this.initLogInterval);
            }
        }, 5000);
    }
    async setOnline(): Promise<void> {
        let connected = 0;
        for (const hyperion of this.hyperions) {
            connected += hyperion.connectionState === 'connected' ? 1 : 0;
        }

        this.library.writedp(`info.connection`, connected !== 0).catch(() => {
            // nothing to do
        });
    }

    /**
     * findDevice - callback function
     *
     * @param protocol http or https
     * @param ip ip address
     * @param port port
     * @param device device description
     */
    findDevice = async (protocol: string, ip: string, port: number, device: DescriptionType): Promise<void> => {
        const data: configOfHyperionInstance = {
            UDN: device.device.UDN.replace('uuid:', ''),
            name: device.device.friendlyName,
            protocol: protocol,
            ip: ip,
            port: port,
            URLBase: device.URLBase,
            token: '',
            enabled: true,
        };

        if (this.hyperions.every(h => h.UDN !== data.UDN)) {
            this.log.info(`Found new hyperion device: ${device.device.friendlyName}`);
            const hyperion = new Hyperion(this.adapter, data.UDN, data);
            this.hyperions.push(hyperion);
            await hyperion.init();
        }
    };

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(): void {
        if (this.initLogInterval) {
            this.adapter.clearInterval(this.initLogInterval);
        }
        for (const hyperion of this.hyperions) {
            hyperion.onUnload();
        }
        this.network.onUnload();
        //this.log.info('unload');
    }

    /**
     * Is called if a subscribed state changes
     * Only react on changes that are in a controls subfolder
     * The state change is saved in the library
     *
     * @param id - The ID of the state that changed
     * @param state - The new state value or null/undefined if the state was deleted
     */
    async onStateChange(id: string, state: ioBroker.State | null | undefined): Promise<void> {
        if (state) {
            const parts = id.split('.');
            if (parts.length > 2 && parts[3] === 'controls') {
                const tid = parts.slice(2).join('.');
                this.library.setdb(tid, 'state', state.val, undefined, state.ack, state.ts);

                const instance = parts[2];
                const hyperion = this.hyperions.find(h => h.UDN === instance);
                if (hyperion) {
                    await hyperion.onStateChange(id, state);
                }
            }
        }
    }
}
