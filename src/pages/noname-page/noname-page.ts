'use strict';

import {Component, Renderer, NgZone} from '@angular/core';
import {Platform, NavController, Events} from "ionic-angular/index";
import { ViewChild, ElementRef } from '@angular/core';
import Timer = NodeJS.Timer;
import {log, PRIORITY_INFO, PRIORITY_ERROR} from "../../services/log";
import {ConnectivityService} from "../../services/connectivity-service";
import {BackgroundGeolocationService} from "../../services/background-geolocation-service";

declare let google;

@Component({
  selector: 'noname-page',
  templateUrl: 'noname-page.html'
})

export class nonamePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any = null;

  public title: string = 'Noname';
  latitude: string = '';
  longitude: string = '';
  markerNb: number = 0;

  constructor(public navCtrl: NavController, private platform: Platform, public trace: log,
              public connectivityService: ConnectivityService, events: Events, renderer: Renderer,
              public backgroundGeolocationService:BackgroundGeolocationService, public zone: NgZone) {

    this.trace.info('create nonamePage');

    renderer.listenGlobal('document', 'online', (event) => {
      this.trace.info('you are online');
      if ((this.map == null) && (this.latitude != '')) { //same location but we init the map
        this.initMap({latitude : this.latitude, longitude: this.longitude}, '#00FF00');
      }
    });

    renderer.listenGlobal('document', 'offline', (event) => {
      this.trace.info('you are offline');
    });

    events.subscribe('BackgroundGeolocationService:setCurrentLocation', (location) => {
      this.setCurrentLocation(location[0]);
    });

    events.subscribe('BackgroundGeolocationService:setCurrentForegroundLocation', (location) => {
      this.setCurrentForegroundLocation(location[0]);
    });


  }

  initMap(location: {latitude:string, longitude:string}, color: string) {
    if (google == null) {
      this.trace.info(`initMap google null`);
      return;
    }
    this.trace.info(`initMap  ${location.latitude},${location.longitude}`);
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    let mapOptions = {
      center: latLng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    if (this.map == null) {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      if (this.backgroundGeolocationService.locations!=undefined) {
        for (let i = 0; i < this.backgroundGeolocationService.locations.length; i++) {
          this.addMarker(this.backgroundGeolocationService.locations[i], '#FF0000');
        }
      } else {
        this.addMarker(location, color);
      }
    } else {
      this.addMarker(location, color);
    }
    this.map.setCenter(latLng);
  }

  setCurrentLocation(location: {latitude:string, longitude:string, provider: string}) {
    this.trace.info(`${location.latitude},${location.longitude},${location.provider}`);

    if ((this.latitude == location.latitude) && (this.longitude == location.longitude)) {
      if (this.connectivityService.isOnline() && (this.map == null)) { //same location but we init the map
        this.initMap(location, '#00FF00');
      }
      return;
    }

    this.latitude = location.latitude;
    this.longitude = location.longitude;

    if(this.connectivityService.isOnline()) {
      this.initMap(location, '#00FF00');
    }

  }

  setCurrentForegroundLocation(position: any) {
    this.trace.info(`foregrnd evnt ${position.coords.latitude},${position.coords.longitude},${position.coords.provider}`);
    this.initMap({latitude:position.coords.latitude, longitude:position.coords.longitude}, '#0000FF');
  }

  addMarker(location: {latitude:string, longitude:string}, color: string){
    if (this.map == null)return;

    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    /*let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });*/

    let marker = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 1,
      map: this.map,
      center: latLng,
      radius: 7
    });

    this.addInfoWindow(marker, `<h4>${this.markerNb++}</h4>`);
  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

   /*
   * set the media URL switch the platform
   */
  getMediaURL(mediaPath) {
    if (this.platform.is('android')) {
      return "/android_asset/www/assets/" + mediaPath;
    }
    return "../../assets/" + mediaPath;
  }

}
