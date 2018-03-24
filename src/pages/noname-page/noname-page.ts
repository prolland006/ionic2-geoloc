'use strict';

import {Component, Renderer, NgZone} from '@angular/core';
import {Platform, NavController, Events} from "ionic-angular/index";
import { ViewChild, ElementRef } from '@angular/core';
import Timer = NodeJS.Timer;
import {log } from "../../services/log";
import {ConnectivityService} from "../../services/connectivity-service";
import {GeolocationService} from "../../services/geolocation-service";
import {Insomnia} from "@ionic-native/insomnia";

declare let google;

const MAX_NB_MARKER = 100;

@Component({
  selector: 'noname-page',
  templateUrl: 'noname-page.html'
})

export class nonamePage {

  @ViewChild('_map') mapElement: ElementRef;
  map: any = null;

  public title: string = 'Noname';
  latitude: string = '';
  longitude: string = '';
  markerList: any[];
  private insomnia: Insomnia;

  constructor(public navCtrl: NavController, private platform: Platform, public trace: log,
              public connectivityService: ConnectivityService, events: Events, renderer: Renderer,
              public GeolocationService:GeolocationService, public zone: NgZone) {

    this.trace.info('create nonamePage');
    this.markerList = new Array(MAX_NB_MARKER);

      this.platform.ready().then(() => {
          this.insomnia.keepAwake()
              .then(
        () => console.log('insomnia success'),
        () => console.log('insomnia error')
              );
      }).catch(err => {
          this.trace.error('nonamePage', 'constructor', `error:${err}`);
      });

    renderer.listenGlobal('document', 'online', (event) => {
      this.trace.info('you are online');
      if ((this.map == null) && (this.latitude != '')) { //same location but we init the map
        this.initMap({latitude : this.latitude, longitude: this.longitude}, '#FF0000');
      }
    });

    renderer.listenGlobal('document', 'offline', (event) => {
      this.trace.info('you are offline');
    });

    events.subscribe('GeolocationService:setCurrentLocation', (location) => {
      this.setCurrentLocation(location[0]);
    });

  }

  pushMarker(marker: any) {
    let removedMarker = this.markerList.shift();
    if (removedMarker != undefined) {
      removedMarker.setMap(null);
    }
    if (this.markerList[this.markerList.length-1] != undefined) {
      this.markerList[this.markerList.length-1].setOptions({fillColor: '#00FF00', strokeColor: '#00FF00'});
    }
    this.markerList.push(marker);
  }

  initMap(location: {latitude:string, longitude:string}, color: string) {
    this.trace.info(`initMap  ${location.latitude},${location.longitude}`);
    if (google == null) {
      this.trace.info(`initMap google null`);
      return;
    }
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    if (this.map == null) {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.trace.info('google map started');
    }
    this.addMarker(location, color);
    this.map.setCenter(latLng);
  }

  setCurrentLocation(location: {latitude:string, longitude:string, provider: string}) {
    if ((this.latitude == location.latitude) && (this.longitude == location.longitude)) {
      if (this.connectivityService.isOnline() && (this.map == null)) { //same location but we init the map
        this.initMap(location, '#FF0000');
      }
      return;
    }

    this.latitude = location.latitude;
    this.longitude = location.longitude;

    if(this.connectivityService.isOnline()) {
      this.initMap(location, '#FF0000');
    }

  }

  addMarker(location: {latitude:string, longitude:string}, color: string){
    if (this.map == null)return;

    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    this.pushMarker(new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 1,
      map: this.map,
      center: latLng,
      radius: 7
    }));

  }

}
