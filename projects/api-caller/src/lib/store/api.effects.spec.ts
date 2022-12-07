import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jest-marbles';
import { Observable, of } from 'rxjs';

import { ApiCallerService } from '../service/api-caller.service';
import { ApiEffects } from './api.effects';
import { initialApiCallerState } from './api.state';

// eslint-disable-next-line max-lines-per-function
describe('ApiEffects', () => {
  let service: ApiEffects;
  let httpMock: HttpTestingController;
  let actions$ = new Observable<Action>();
  const initialState = { '@deejayy/api-caller': { '/': initialApiCallerState } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        // StoreModule.forRoot([apiReducer]),
        // EffectsModule.forRoot([ApiEffects]),
      ],
      providers: [ApiEffects, ApiCallerService, provideMockStore({ initialState }), provideMockActions(() => actions$)],
    });

    service = TestBed.inject(ApiEffects);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('handle cache', () => {
    actions$ = of({ type: 'Test' });
    const result = service.mergeWithCache({ path: '/', useCache: true })(true);
    const expected = cold('(a|)', {
      a: { payload: { path: '/', useCache: true }, response: undefined, type: '[API] Get From Cache' },
    });
    expect(result).toBeObservable(expected);
  });

  it('handle success action, empty', () => {
    actions$ = of({ type: 'Test' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = service.handleSuccess({ path: '/' })(undefined as unknown as HttpResponse<any>);
    const expected = { request: { path: '/' }, response: undefined, type: '[API] Get Success' };
    expect(result).toEqual(expected);
  });

  it('handle success action, response', () => {
    actions$ = of({ type: 'Test' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = service.handleSuccess({ path: '/' })({} as HttpResponse<any>);
    const expected = { request: { path: '/' }, response: {}, type: '[API] Get Success' };
    expect(result).toEqual(expected);
  });

  it('handle error action, empty', () => {
    actions$ = of({ type: 'Test' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = service.handleError({ path: '/' })(undefined as unknown as HttpResponse<any>);
    const expected = cold('(a|)-', {
      a: { request: { path: '/' }, response: undefined, type: '[API] Get Fail' },
    });
    expect(result).toBeObservable(expected);
  });

  it('handle error action, response', () => {
    actions$ = of({ type: 'Test' });
    const result = service.handleError({ path: '/' })(new HttpErrorResponse({ headers: new HttpHeaders() }));
    const expected = cold('(a|)-', {
      a: {
        request: { path: '/' },
        response: new HttpErrorResponse({}),
        headers: {},
        type: '[API] Get Fail',
      },
    });
    expect(result).toBeObservable(expected);
  });
});
