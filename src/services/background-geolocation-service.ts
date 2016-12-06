import {Injectable } from "@angular/core";
import { log } from "./log";
import { BackgroundGeolocation } from 'ionic-native';
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
export class BackgroundGeolocationService {

    trackerInterval: Timer;
    postGeolocInterval: Timer;
    locations: any;
    public watch: any;
    currentLocation: {latitude:string, longitude:string, timestamp?: Date};

    // BackgroundGeolocation is highly configurable. See platform specific configuration options
    backGroundConfig = {
        interval: 1000,
        desiredAccuracy: 10,
        locationTimeout: 500,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        maxLocations: 20, //default = 10000
    };

    constructor(private http: Http, private platform: Platform, public trace: log, private events: Events,
                public connectivityService: ConnectivityService) {

        if (this.platform.is('android')) {
            this.platform.ready().then(() => {
                this.startTracking();

            }).catch(err => {
                this.trace.error('BackgroundGeolocationService', 'constructor', `error:${err}`);
            });

        }
    }


    backgroundConfigureAndStart() {
        this.trace.info(`Background tracking` );
        BackgroundGeolocation.configure(
            (location) => {
                this.trace.info(`configure  ${location.latitude},${location.longitude}`);

                this.setCurrentLocation(location);
                this.trackerInterval = setInterval(() => {
                    this.eventRefreshLocations();
                }, REFRESH_LOCATION_TIMER);

                this.postGeolocInterval = setInterval(() => {
                    if(this.connectivityService.isOnline()) {
                        this.eventPostGeoloc();
                    }
                }, POST_GEOLOCATION_TIMER);

                // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                //BackgroundGeolocation.finish(); // FOR IOS ONLY

            }, (error) => {
                this.trace.error('BackgroundGeolocationService','constructor',error);
            }, this.backGroundConfig);
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
        BackgroundGeolocation.getLocations().then(locations => {
            this.locations = locations;
            if (locations.length != 0) {
                this.setCurrentLocation(locations[locations.length-1]);
            }
        }).catch(error => {
            this.trace.error('BackgroundGeolocationService','refreshLocations', `error:${error.toString()}`);
        });

    }

    startTracking(): void {
        this.backgroundConfigureAndStart();
        this.backgroundWatchLocationMode();
        this.backgroundIsLocationEnabled();
    }

    backgroundWatchLocationMode() {
        BackgroundGeolocation.watchLocationMode()
            .then((enabled)=>{
                if (enabled) {
                    // location service are now enabled
                    // call backgroundGeolocation.start
                    // only if user already has expressed intent to start service
                    this.trace.info('backgroundGeolocation enabled');
                } else {
                    // location service are now disabled or we don't have permission
                    // time to change UI to reflect that
                    this.trace.info('backgroundGeolocation disabled');
                }
            },
            (error)=>{
                this.trace.error('BackgroundGeolocationService','backgroundWatchLocationMode','Error watching location mode. Error:' + error);
            }
        );
    }

    backgroundIsLocationEnabled() {
        BackgroundGeolocation.isLocationEnabled()
            .then((enabled)=> {
                if (enabled) {
                    this.trace.info('backgroundIsLocationEnabled enabled');
                    BackgroundGeolocation.start()
                        .then(()=>{
                            // service started successfully
                            // you should adjust your app UI for example change switch element to indicate
                            // that service is running
                            this.trace.info('backgroundIsLocationEnabled start');
                            BackgroundGeolocation.deleteAllLocations();
                            BackgroundGeolocation.start();
                        },
                        (error)=>{
                            // Tracking has not started because of error
                            // you should adjust your app UI for example change switch element to indicate
                            // that service is not running
                            if (error.code === 2) {
                                //'Not authorized for location updates
                            } else {
                                this.trace.error('BackgroundGeolocationService','backgroundIsLocationEnabled',`Start failed: ${error}`);
                            }
                        }
                        );
                } else {
                    // Location services are disabled
                    this.trace.info('backgroundIsLocationEnabled disabled');
                }
            });
    }

    setCurrentLocation(location: {latitude:string, longitude:string}) {
        this.currentLocation = location;
        this.currentLocation.timestamp = new Date();
        this.events.publish('BackgroundGeolocationService:setCurrentLocation', location);
    }

    stopTracking(): void {
        clearInterval(this.trackerInterval);
        BackgroundGeolocation.getLocations().then(locations => {
            this.locations = locations;
            if (locations.length != 0) {
                this.setCurrentLocation(locations[locations.length-1]);
            }
        }).catch(error => {
            this.trace.error('BackgroundGeolocationService','stopTracking',error);
        });
        BackgroundGeolocation.stop();
    }
}
