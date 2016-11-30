import { Injectable } from '@angular/core';
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';
import {log, PRIORITY_INFO} from "./log";

declare let Connection;

@Injectable()
export class ConnectivityService {

    onDevice: boolean;

    constructor(public platform: Platform, public fifoTrace: log){
        this.fifoTrace.log({ level: PRIORITY_INFO, message: 'create ConnectivityService' });
        this.onDevice = this.platform.is('cordova');
    }

    isOnline(): boolean {
        if(this.onDevice && Network.connection){
            return Network.connection !== Connection.NONE;
        } else {
            return navigator.onLine;
        }
    }

    isOffline(): boolean {
        if(this.onDevice && Network.connection){
            return Network.connection === Connection.NONE;
        } else {
            return !navigator.onLine;
        }
    }
}
