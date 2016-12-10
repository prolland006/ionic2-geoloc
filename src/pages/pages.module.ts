import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { nonamePage } from "./noname-page/noname-page";
import {log} from "../services/log";
import {ConnectivityService} from "../services/connectivity-service";
import {GeolocationService} from "../services/geolocation-service";

@NgModule({
  declarations: [
    nonamePage
  ],
  imports: [ IonicModule ],
  exports: [
    nonamePage
  ],
  entryComponents: [ ],
  providers: [ GeolocationService, log, ConnectivityService ],
})

export class PagesModule {}
