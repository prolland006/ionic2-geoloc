import {PRIORITY_INFO} from "./log";
export class logMessage {

    classe: string;
    method: string;
    level: number;
    message: string;
    timestamp: Date;

    constructor({classe, method, level, message}: {classe ?: string, method?: string, level?: number, message: string}) {
        this.classe = classe;
        this.method = method;
        if (level == undefined) {
            this.level = PRIORITY_INFO;
        } else {
            this.level = level;
        }
        this.message = message;
        this.timestamp = new Date();
    }

    toString() {
        return `${this.timestamp.getHours()}:${this.timestamp.getMinutes()}:${this.timestamp.getSeconds()} ${this.classe == undefined?'':this.classe} ${this.method == undefined?'':this.method} ${this.level} ${this.message}`;
    }
}
