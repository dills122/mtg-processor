import _ from 'lodash';
import bunyan from 'bunyan';

export interface LoggerParams {
    isPretty: boolean | true
};

export default class Logger {
    isPretty: boolean;
    bunyan: bunyan;
    constructor(args: LoggerParams) {
        this.isPretty = args.isPretty;
        if (this.isPretty) {
            this.bunyan = bunyan.createLogger({
                level: 4,
                name: 'MTG-Processor'
            });
        }
    }

    info(message: string, object?: object) {
        if (this.bunyan) {
            this.bunyan.info(`${message}`);
            if (object) {
                this.bunyan.info(object);
            }
            return;
        }
        console.log(message);
        if (object) {
            console.log(JSON.stringify(object, null, 4));
        }
    }

    warn(message: string, object?: object) {
        if (this.bunyan) {
            this.bunyan.warn(`${message}`);
            if (object) {
                this.bunyan.warn(object);
            }
            return;
        }
        console.warn(message);
        if (object) {
            console.warn(JSON.stringify(object, null, 4));
        }
    }

    error(message: string, object?: object) {
        if (this.bunyan) {
            this.bunyan.error(`${message}`);
            if (object) {
                this.bunyan.error(object);
            }
            return;
        }
        console.error(message);
        if (object) {
            console.error(JSON.stringify(object, null, 4));
        }
    }
};