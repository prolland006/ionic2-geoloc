import {Injectable } from "@angular/core";
import { log } from "./log";
import { BackgroundGeolocation, Geolocation, Geoposition} from 'ionic-native';
import Timer = NodeJS.Timer;
import { Platform, Events} from "ionic-angular";
import { Observable} from "rxjs";

@Injectable()
export class BackgroundGeolocationService {

    trackerInterval: Timer;
    locations: any;
    public watch: any;

    // BackgroundGeolocation is highly configurable. See platform specific configuration options
    backGroundConfig = {
        interval: 1000,
        locationTimeout: 500,
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        maxLocations: 100, //default = 10000
    };


    // Foreground Tracking
    foreGroundOptions = {
        frequency: 2000,
        enableHighAccuracy: true,
        maximumAge: Infinity,
        timeout: 2000
    };

    constructor(private platform: Platform, public trace: log, private events: Events) {

        if (this.platform.is('android')) {
            this.platform.ready().then(() => {
                this.startTracking();

            }).catch(err => {
                this.trace.error('BackgroundGeolocationService', 'constructor', `error:${err}`);
            });

        }
    }

    foreGroundWatchPosition() {
        this.watch = Geolocation.watchPosition(this.foreGroundOptions)
            .subscribe((position: any) => {
                    if (position.code === undefined) {
                        this.events.publish('BackgroundGeolocationService:setCurrentForegroundLocation', position);
                    } else {
                        this.trace.error('BackgroundGeolocationService','constructor',position.message);
                    }
                },
                (error)=>{this.trace.error('BackgroundGeolocationService','foreGroundWatchPosition',error)},
                ()=>this.trace.info('watchPosition success'));

    }

    backgroundConfigureAndStart() {
        this.trace.info(`Background tracking` );
        BackgroundGeolocation.configure(
            (location) => {
                this.trace.info(`configure  ${location.latitude},${location.longitude}`);

                this.setCurrentLocation(location);
                this.trackerInterval = setInterval(() => {
                    this.refreshLocations();
                }, 2000);

                // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                //BackgroundGeolocation.finish(); // FOR IOS ONLY

            }, (error) => {
                this.trace.error('BackgroundGeolocationService','constructor',error);
            }, this.backGroundConfig);
    }


    refreshLocations(): void {
        BackgroundGeolocation.getLocations().then(locations => {
            this.locations = locations;
            if (locations.length != 0) {
                this.trace.info(`lngth ${locations.length}`);
                this.setCurrentLocation(locations[locations.length-1]);
            }
        }).catch(error => {
            this.trace.error('BackgroundGeolocationService','refreshLocations', `error:${error.toString()}`);
        });

        // Foreground Tracking
        Geolocation.getCurrentPosition(this.foreGroundOptions)
            .then((position: Geoposition) => {
                this.trace.info(`Foregrnd current ${position.coords.latitude},${position.coords.longitude}`);
            }).catch((error)=>{
                if ((error.code == undefined) || (error.code != 3)) { //3=timeout
                    this.trace.error('BackgroundGeolocationService', 'refreshLocations', `error Foregrnd.getCurrentPos:${error.toString()}`);
                }
            });
    }

    startTracking(): void {
        this.trace.info('startTracker');
        this.foreGroundWatchPosition();
        this.backgroundConfigureAndStart();
        this.backgroundWatchLocationMode();
        this.backgroundIsLocationEnabled();
    }

    backgroundWatchLocationMode() {
        this.trace.info('backgroundWatchLocationMode');
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
        this.trace.info('backgroundIsLocationEnabled');
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
                                this.trace.error('BackgroundGeolocationService','backgroundIsLocationEnabled','Start failed: ' + error.message);
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
