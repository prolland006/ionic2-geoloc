
import {Injectable, NgZone} from "@angular/core";
import {logMessage} from "./log-message";
import { File } from 'ionic-native';
import {Platform} from "ionic-angular";
import {Http, Headers} from "@angular/http";
import 'rxjs/add/operator/toPromise';

export const PRIORITY_INFO = 1;
export const PRIORITY_ERROR = 2;

const MAXSIZE = 20;

declare var cordova: any;

// parameters
const WRITE_LOG = false;
const POST_LOG = false;
const POST_URL = "https://log-webservice.herokuapp.com";
//const POST_URL = "http://192.168.0.11:3000";
//const POST_URL = "http://127.0.0.1:3000";


@Injectable()
export class log {

  public fifoTrace: logMessage[];

  constructor(private http: Http, private platform: Platform, public zone: NgZone) {
    this.fifoTrace = new Array(MAXSIZE);
    this.fifoTrace.fill(new logMessage({classe: '', method: '', level: PRIORITY_INFO, message: '' }));
  }

  log(msg: {classe ?: string, method?: string, level?: number, message: string}) {
    if (msg == null) {
      this.log({classe:'log', method:'log', level:PRIORITY_ERROR, message:'null log exception error'})
      throw new Error('null log exception error');
    }
    if (msg.message == null) {
      this.log({classe:'log', method:'log', level:PRIORITY_ERROR, message:'null log message exception error'})
      throw new Error('null log exception error');
    }
    this.zone.run(()=>{
      let match = this.fifoTrace[this.fifoTrace.length-1].message.match(/^(.+)\((\d+)\)$/);

      if ((this.fifoTrace[this.fifoTrace.length-1].message == msg.message)) {
        this.fifoTrace[this.fifoTrace.length - 1].message = this.incMessage(msg.message);

      } else if ((match != null) && (match[1] == msg.message)) {
        this.fifoTrace[this.fifoTrace.length - 1].message = this.incMessage(this.fifoTrace[this.fifoTrace.length - 1].message);

      } else {
        let logMsg = new logMessage(msg);
        this.fifoTrace.shift();
        this.fifoTrace.push(logMsg);
        if (WRITE_LOG && this.platform.is('android')) {
          this.platform.ready().then(() => {
            this.write(logMsg);
          });
        }
        if (POST_LOG) {
            this.postLog(logMsg);
        }
      }
    });
    console.log(msg.message);
  }

  postLog(logMsg:logMessage) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      this.http.post(`${POST_URL}/log/add`, JSON.stringify(logMsg), {headers})
        .toPromise() // Promise<Response>
        // Response{_body: '', status: 200, ok: true, statusText: null, headers: null, type: null, url: null}
        .then((response) => {
          if (response.status !== 201) {
              this.error('log','postLog',`error response: ${response.status}`);
          }
        })
        .catch(error => {
          this.error('log','postLog',error.message)
        });
  }

  info(message: string) {
    this.log({ message: message});
  }

  /**
   * "toto" --> "toto(1)"
   * "toto(1)" --> "toto(2)"
   * @param message
   */
  incMessage(message) {
    if (message.length == 0) {
      return "(1)";
    }
    let match = message.match(/^(.+)\((\d+)\)$/);
    if ((message.length >= 3) && (match == null)) {  // "toto" --> "toto(1)"
      return message.concat("(1)");
    }
    let nb = parseInt(match[2])+1;
    return `${match[1]}(${nb})`;
  }

  write(message: logMessage) {
    const fs = cordova.file.externalApplicationStorageDirectory;

    File.checkDir(fs, 'log')
      .then(_ => {
        let today = new Date();
        let filename = `log_${today.getFullYear()}.${today.getMonth()}.${today.getDay()}.log`;
        File.checkFile(fs+'/log', filename)
            .then((success)=> {

              File.writeExistingFile(fs+'/log', filename, message.toString()+'\r\n')
                  .then((success)=> {
                    // success
                  }, (error) => {
                    // error
                    this.error('log', 'write', `error writeExistingFile:${error.message}`)
                  });
            }
            , (error)=> {
              File.writeFile(fs+'/log', filename, message.toString()+'\r\n', {'append':true})
                .then((success)=> {
                  // success
                },(error)=> {
                  // error
                  this.error('log', 'write', `error writeFile:${error.message}`)
                });

          });
      })
      .catch(err => {
        File.createDir(fs, "log", false)
            .then((success) => {
              // success
              this.info('create log directory success');
              this.write(message);
            }, (error) => {
              // error
              this.error('log','write',`unable to create log directory ${error.message}`);
            });
      });

}


error(classe: string, method: string, message: string) {
    this.log({ level: PRIORITY_ERROR, message: message, method: method, classe: classe});
  }

}
