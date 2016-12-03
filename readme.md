# Ionic2-geoloc
## Summary
Find the GPS position where you are and put every 2 seconds a marker on google map. Everything is logged. The position is sent to log-webservice on Heroku.

## Setup
- npm i
- ionic serve

## Android
- install android studio and install an android emulator
- cordova plugin add cordova-plugin-crosswalk-webview
- ionic plugin add cordova-plugin-mauron85-background-geolocation
- ionic plugin add cordova-plugin-file --save
- ionic platform add android --save
- ionic build android --release
- import platform directory in android studio
- cordova plugin add cordova-plugin-media
- ionic emulate android
- ionic run android --list
- ionic run android --device
- cordova plugin add cordova-plugin-network-information
- ionic plugin add cordova-plugin-geolocation
- ionic plugin ls
- ionic (command list)
- npm update -g cordova
- cordova platform ls

You can add additional flags when using  ionic run.

-c will show console logs.
-s will show server logs.
-l will perform live reload of the application when code changes.
So you can use something like ionic run android -cls

Note that for livereload to work if the device is not connected directly make sure its in the same network as the serving device. Make sure to serve to a local IP address in this case (you can use ionic address to change that).


## Unit tests
- npm test
- http://lathonez.github.io/2016/ionic-2-unit-testing/

## Documentation
http://ionicframework.com/docs/v2/
https://developers.google.com/web/tools/chrome-devtools/remote-debugging/
https://github.com/rodrigoreal/ionic2-google-maps
http://www.joshmorony.com/ionic-2-how-to-use-google-maps-geolocation-video-tutorial/
http://www.joshmorony.com/adding-background-geolocation-to-an-ionic-2-application/
http://www.joshmorony.com/creating-an-advanced-google-maps-component-in-ionic-2/
http://www.gajotres.net/ionic-2-integrating-google-maps/
https://developers.google.com/maps/documentation/javascript/
https://www.npmjs.com/package/cordova-plugin-mauron85-background-geolocation



