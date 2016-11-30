import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { PagesModule } from '../pages';
import { nonamePage } from "../pages/noname-page/noname-page";
import {LogPage} from "../pages/log-page/log-page";
import {log} from "../services/log";
import {ConnectivityService} from "../services/connectivity-service";
import {BackgroundGeolocationService} from "../services/background-geolocation-service";

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    PagesModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    nonamePage,
    LogPage
  ],
  providers: [ ],
})

export class AppModule {}
