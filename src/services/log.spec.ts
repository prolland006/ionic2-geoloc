import {log, PRIORITY_INFO, PRIORITY_ERROR} from "./log";
import {inject, fakeAsync} from "@angular/core/testing";
import {NgZone} from "@angular/core";
import {PlatformMock} from "../mocks";
import {Http} from "@angular/http";

describe('Pages: nonamePage', () => {

    it('should test log', fakeAsync(inject([NgZone], (ngZone) => {

        let fifoTrace = new log(null, (<any> new PlatformMock), (<any> ngZone));
        expect(fifoTrace.incMessage('')).toEqual('(1)');
        expect(fifoTrace.incMessage('toto')).toEqual('toto(1)');
        expect(fifoTrace.incMessage('toto(1)')).toEqual('toto(2)');
        expect(fifoTrace.incMessage('toto(2)')).toEqual('toto(3)');
        expect(fifoTrace.incMessage('toto(22)')).toEqual('toto(23)');
        expect(fifoTrace.incMessage('toto()')).toEqual('toto()(1)');
        expect(fifoTrace.fifoTrace.length).toEqual(20);
        fifoTrace.log({message:'test', level:PRIORITY_INFO, classe:'describe', method:'it'});
        expect(fifoTrace.fifoTrace.length).toEqual(20);
        expect(fifoTrace.fifoTrace[19].message).toEqual('test');
        expect(fifoTrace.fifoTrace[19].level).toEqual(PRIORITY_INFO);
        expect(fifoTrace.fifoTrace[19].classe).toEqual('describe');
        expect(fifoTrace.fifoTrace[19].method).toEqual('it');
        expect(()=>{fifoTrace.log(null)}).toThrowError();
        expect(()=>{fifoTrace.log({message:null})}).toThrowError();
        fifoTrace.error('fifoTrace','method','error');
        expect(fifoTrace.fifoTrace.length).toEqual(20);
        expect(fifoTrace.fifoTrace[19].message).toEqual('error');
        expect(fifoTrace.fifoTrace[19].level).toEqual(PRIORITY_ERROR);
        expect(fifoTrace.fifoTrace[19].classe).toEqual('fifoTrace');
        expect(fifoTrace.fifoTrace[19].method).toEqual('method');
    })));

    it('should test some stuffs', () => {
        let markerList: any[];
        markerList = new Array(20);
        expect(markerList.length).toEqual(20);
        expect(markerList[0]).toEqual(undefined);
        let removedThing = markerList.shift();
        expect(markerList.length).toEqual(19);
        expect(removedThing).toEqual(undefined);
        markerList.push({stuff: 'gogo'});
        expect(markerList.length).toEqual(20);
        expect(markerList[markerList.length-1]).toEqual({stuff: 'gogo'});
        markerList.shift();
        expect(markerList.length).toEqual(19);
        markerList.push({stuff: 'gugus'});
        expect(markerList.length).toEqual(20);
        expect(markerList[markerList.length-2]).toEqual({stuff: 'gogo'});
        expect(markerList[markerList.length-1]).toEqual({stuff: 'gugus'});
    });

});

