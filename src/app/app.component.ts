import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { environment } from '../environments/environment';
import { nonamePage } from "../pages/noname-page/noname-page";
import { BackgroundGeolocation } from 'ionic-native';
import { LogPage } from "../pages/log-page/log-page";

@Component({
  templateUrl: 'app.html',
})
export class MyApp {

  @ViewChild(Nav) public nav: Nav;

  public rootPage: any;
  public pages: Array<{ title: string, component: any }>;
  private menu: MenuController;
  private platform: Platform;

  constructor(platform: Platform, menu: MenuController) {

    this.platform = platform;
    this.menu = menu;

    this.rootPage = nonamePage;
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'map', component: nonamePage },
      { title: 'log', component: LogPage },
    ];
  }

  private initializeApp(): void {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      // https://github.com/lathonez/clicker/issues/148#issuecomment-254436635
      // StatusBar.styleDefault();
      console.log('production: ' + environment.production);
    });
  }

  public openPage(page: any): void {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  };
}
