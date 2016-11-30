import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { nonamePage } from "./noname-page/noname-page";
import {log} from "../services/log";
import {ConnectivityService} from "../services/connectivity-service";
import {BackgroundGeolocationService} from "../services/background-geolocation-service";

@NgModule({
  declarations: [
    nonamePage
  ],
  imports: [ IonicModule ],
  exports: [
    nonamePage
  ],
  entryComponents: [ ],
  providers: [ BackgroundGeolocationService, log, ConnectivityService ],
})

export class PagesModule {}
