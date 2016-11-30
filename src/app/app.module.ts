import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { PagesModule } from '../pages';
import { nonamePage } from "../pages/noname-page/noname-page";

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
    nonamePage
  ],
  providers: [ ],
})

export class AppModule {}
