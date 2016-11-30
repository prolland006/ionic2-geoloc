import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { nonamePage } from './noname-page';
import { fakeAsync, tick} from "@angular/core/testing/fake_async";

let fixture: ComponentFixture<nonamePage> = null;
let instance: any = null;
let element: any = null;

describe('Pages: nonamePage', () => {

  beforeEach(() => {
    TestUtils.configureIonicTestingModule([nonamePage]);
    fixture = TestBed.createComponent(nonamePage);
    instance = fixture.debugElement.componentInstance;
    element = fixture.debugElement.nativeElement;
  });




});
