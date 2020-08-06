import { createConnection, Connection } from 'mysql';
import { requireF } from '../util';

export interface RDSBaseArgs {
    secureConfig: SecureConfig
};

export interface SecureConfig {
    host: string,
    user: string,
    password: string,
    database: string
};

export default class RDSBase {
    secureConfig: SecureConfig;
    connection: Connection;
    constructor(args: RDSBaseArgs) {
        const { secureConfig } = args;
        if (!secureConfig) {
            this.loadConfig();
        }
        if (!this.secureConfig) {
            throw new Error('No secure config available, cannot proceed');
        }
    }

    async query<T>(statement: string, record: object): Promise<T> {
        if (!this.connection) {
            this.connection = await this.connect();
        }
        return new Promise((resolve, reject) => {
            this.connection.query(statement, record, (err, queryResults) => {
                if (err) {
                    return reject(err);
                }
                if (!queryResults) {
                    return reject(new Error('Empty query results'))
                }
                return resolve(queryResults);
            });
        });
    }

    async connect(args?: RDSBaseArgs): Promise<Connection> {
        const connection = createConnection(this.secureConfig || args);
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(connection);
            });
        });
    }

    loadConfig(): void {
        const config = requireF('../secure.config');
        if (config === false) {
            return;
        }
        if (!config.main) {
            return;
        }
        this.secureConfig = config.main.exports;
    }
};