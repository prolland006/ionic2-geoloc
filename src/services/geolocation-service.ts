import {Injectable } from "@angular/core";
import { log } from "./log";
import { Geolocation, Geoposition} from 'ionic-native';
import Timer = NodeJS.Timer;
import { Platform, Events} from "ionic-angular";
import { Observable} from "rxjs";
import {Http, Headers} from "@angular/http";
import {ConnectivityService} from "./connectivity-service";

//parameters
const REFRESH_LOCATION_TIMER = 2000; //get geolocations every .. milliseconds
const POST_GEOLOCATION_TIMER = 5000; //send geolocation to server every .. milliseconds
const POST_URL = "https://log-webservice.herokuapp.com";
//const POST_URL = "http://192.168.0.11:3000";
//const POST_URL = "http://127.0.0.1:3000";

@Injectable()
export class GeolocationService {

    trackerInterval: Timer;
    postGeolocInterval: Timer;
    public watch: any;
    currentLocation: {latitude:string, longitude:string, timestamp?: Date};

    // Foreground Tracking
    foreGroundOptions = {
        frequency: 2000,
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 2000
    };

    constructor(private http: Http, private platform: Platform, public trace: log, private events: Events,
                public connectivityService: ConnectivityService) {

        if (this.platform.is('android')) {
            this.platform.ready().then(() => {
                this.startTracking();

            }).catch(err => {
                this.trace.error('GeolocationService', 'constructor', `error:${err}`);
            });

        }
    }

    foreGroundWatchPosition() {
        this.watch = Geolocation.watchPosition(this.foreGroundOptions)
            .subscribe((position: any) => {
                    if (position.code === undefined) {
                        this.events.publish('GeolocationService:setCurrentForegroundLocation', position);
                    } else {
                        this.trace.error('GeolocationService','constructor',position.message);
                    }
                },
                (error)=>{this.trace.error('GeolocationService','foreGroundWatchPosition',error)},
                ()=>this.trace.info('watchPosition success'));

    }

    configureAndStart() {
        this.trackerInterval = setInterval(() => {
            this.eventRefreshLocations();
        }, REFRESH_LOCATION_TIMER);

        this.postGeolocInterval = setInterval(() => {
            if(this.connectivityService.isOnline()) {
                this.eventPostGeoloc();
            }
        }, POST_GEOLOCATION_TIMER);
    }

    eventPostGeoloc() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        this.http.post(`${POST_URL}/log/add`, JSON.stringify(this.currentLocation), {headers})
            .toPromise() // Promise<Response>
            // Response{_body: '', status: 200, ok: true, statusText: null, headers: null, type: null, url: null}
            .then((response) => {
                if (response.status !== 201) {
                    this.trace.error('log','postLog',`error response: ${response.status}`);
                }
            })
            .catch(error => {
                this.trace.error('log','postLog',`err post log:${error}`);
            });
    }

    eventRefreshLocations(): void {
        Geolocation.getCurrentPosition(this.foreGroundOptions)
            .then((position: Geoposition) => {
                this.setCurrentLocation({latitude:position.coords.latitude.toString(), longitude:position.coords.longitude.toString()});
            }).catch((error)=>{
                if ((error.code == undefined) || (error.code != 3)) { //3=timeout
                    this.trace.error('GeolocationService', 'refreshLocations', `error Foregrnd.getCurrentPos:${error.toString()}`);
                }
            });
    }

    startTracking(): void {
        this.foreGroundWatchPosition();
        this.configureAndStart();
    }

    setCurrentLocation(location: {latitude:string, longitude:string}) {
        this.currentLocation = location;
        this.currentLocation.timestamp = new Date();
        this.events.publish('GeolocationService:setCurrentLocation', location);
    }

}
