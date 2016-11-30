import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {log, PRIORITY_INFO} from "../../services/log";
import {logMessage} from "../../services/log-message";

@Component({
  selector: 'page-log-page',
  templateUrl: 'log-page.html',
})
export class LogPage {

  public title: string = 'Log';
  public fifoTrace: logMessage[];

  constructor(public navCtrl: NavController, public trace: log) {
    this.fifoTrace = this.trace.fifoTrace;
    this.trace.info('create LogPage');
  }

}
