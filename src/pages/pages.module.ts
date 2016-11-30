import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { nonamePage } from "./noname-page/noname-page";
import { LogPage } from "./log-page/log-page";
import {log} from "../services/log";
import {ConnectivityService} from "../services/connectivity-service";
import {BackgroundGeolocationService} from "../services/background-geolocation-service";

@NgModule({
  declarations: [
    nonamePage,
    LogPage
  ],
  imports: [ IonicModule ],
  exports: [
    nonamePage,
    LogPage
  ],
  entryComponents: [ ],
  providers: [ BackgroundGeolocationService, log, ConnectivityService ],
})

export class PagesModule {}
