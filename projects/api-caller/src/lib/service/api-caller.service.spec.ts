/* eslint-disable max-lines-per-function */
import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jest-marbles';
import { of } from 'rxjs';

import { ApiCallItem, SimplifiedHttpOptions } from '../model/api-call-item.model';
import { ApiEffects } from '../store/api.effects';
import { apiReducer } from '../store/api.reducer';
import { initialApiCallerState } from '../store/api.state';
import { ApiCallerService } from './api-caller.service';
import { ApiConnector } from './api-connector';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

class CustomApiConnector extends ApiConnector {
  public override defaultApiUrl = '/api/';
  public override errorHandler = () => {
    console.error('Handled in CustomApiConnector');
  };
  public override tokenData$ = of('custom injected token');
}

class MockHttpClient {
  public request = jest.fn(() => {
    return of('true');
  });
}

describe('ApiCallerService', () => {
  let service: ApiCallerService;
  let httpMock: HttpTestingController;
  let store: MockStore;
  const initialState = { '@deejayy/api-caller': { '/': initialApiCallerState } };

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiCallerService, provideMockStore({ initialState })],
    });

    service = TestBed.inject(ApiCallerService);
    store = TestBed.inject(MockStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDefaultApiUrl', () => {
    const result = service.getDefaultApiUrl();
    expect(result).toBe('/');
  });

  it('getTokenData', (done) => {
    const result = service.getTokenData();
    result.subscribe((value) => {
      // eslint-disable-next-line @typescript-eslint/quotes
      expect(value).toBe("[@deejayy/api-caller] Can't send requests with authorization, token provider not found");
      done();
    });
  });

  it('getErrorHandler', () => {
    console.warn = jest.fn();
    const result = service.getErrorHandler();
    result({
      request: null as unknown as ApiCallItem,
      response: {
        status: 409,
        headers: null as unknown as HttpHeaders,
        ok: false,
        statusText: '',
        type: HttpEventType.Response,
        url: '',
      },
    });
    expect(console.warn).toBeCalledWith('[@deejayy/api-caller] Unhandled API error occurred, code: 409');
  });

  it('getApiCallPayload', () => {
    let result;

    result = service.getApiCallPayload({
      path: '/test-path/',
    });
    expect(result).toEqual({
      payload: {
        api: '/',
        path: '/test-path/',
      },
    });

    result = service.getApiCallPayload({
      api: 'http://test-api/',
      path: 'test-path/',
    });
    expect(result).toEqual({
      payload: {
        api: 'http://test-api/',
        path: 'test-path/',
      },
    });
  });

  it('createApiResults', (done) => {
    const result = service.createApiResults({
      apiCallItem: {
        path: '/',
      }
    });
    result.data$.subscribe((v) => {
      expect(v).toEqual(null);
      done();
    });
  });

  it('makeHeaders', () => {
    const headers = new HttpHeaders();

    const options: SimplifiedHttpOptions = {};
    let result: HttpHeaders;

    result = service.makeHeaders(
      {
        path: '/',
      },
      null as unknown as SimplifiedHttpOptions,
    );
    expect(result).toEqual(headers);
    expect(result.get('Content-Type')).toEqual(null);

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
      },
      null as unknown as SimplifiedHttpOptions,
    );
    expect(console.warn).toBeCalledWith(
      '[@deejayy/api-caller] No file selected for upload but binaryUpload field name is set',
    );

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
        payload: [new Blob()],
      },
      options,
    );
    expect(result.get('Content-Type')).toEqual('application/x-www-form-urlencoded');
    expect(JSON.stringify(options)).toEqual('{"body":{}}');
  });

  it('makeRequest GET', fakeAsync(() => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
    });
    result.subscribe((v) => {
      expect(v).toEqual(new HttpResponse({ body: { flushed: true }, url: 'http://localhost/' }));
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('GET');
    req.flush({ flushed: true });
    tick();
  }));

  it('makeRequest DELETE', fakeAsync(() => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
      method: 'DELETE',
    });
    result.subscribe((v) => {
      expect(v).toEqual(new HttpResponse({ body: { flushed: true }, url: 'http://localhost/' }));
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('DELETE');
    req.flush({ flushed: true });
    tick();
  }));

  it('makeRequest POST (implicit)', fakeAsync(() => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
      payload: {},
    });
    result.subscribe((v) => {
      expect(v).toEqual(new HttpResponse({ body: { flushed: true }, url: 'http://localhost/' }));
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('POST');
    req.flush({ flushed: true });
    tick();
  }));

  it.skip('should reset api', () => {
    const expected = cold('a', { a: { payload: { path: '/', api: '/' }, type: '[API] Clear State' } });
    service.resetApi({ path: '/' });
    expect(store.scannedActions$).toBeObservable(expected);
  });

  it.skip('should reset all api', () => {
    service.resetAllApi();
    const expected = cold('a', { a: { type: '[API] Clear Full State' } });
    expect(store.scannedActions$).toBeObservable(expected);
  });

  it.skip('should call api', () => {
    service.callApi({ path: '/' });
    const expected = cold('a', { a: { payload: { path: '/', api: '/' }, type: '[API] Get' } });
    expect(store.scannedActions$).toBeObservable(expected);
  });

  it.skip('should call api with binary', () => {
    service.callApi({ path: '/', binaryUpload: 'fileField', payload: ['a'] });
    const expected = cold('a', {
      a: { payload: { path: '/', api: '/', binaryUpload: 'fileField', payload: { 0: 'a' } }, type: '[API] Get' },
    });
    expect(store.scannedActions$).toBeObservable(expected);
  });

  it.skip('should call api with binary missing payload', () => {
    service.callApi({ path: '/', binaryUpload: 'fileField' });
    const expected = cold('a', {
      a: { payload: { path: '/', api: '/', binaryUpload: 'fileField', payload: undefined }, type: '[API] Get' },
    });
    expect(store.scannedActions$).toBeObservable(expected);
  });

  it.skip('should call api with payload', () => {
    service.callApi({ path: '/', payload: ['a'] });
    const expected = cold('a', {
      a: { payload: { path: '/', api: '/', payload: ['a'] }, type: '[API] Get' },
    });
    expect(store.scannedActions$).toBeObservable(expected);
  });
});

describe('ApiCallerService with Connector', () => {
  let service: ApiCallerService;
  let httpMock: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot([apiReducer]), EffectsModule.forRoot([ApiEffects])],
      providers: [
        ApiCallerService,
        { provide: ApiConnector, useClass: CustomApiConnector },
        { provide: HttpClient, useClass: MockHttpClient },
      ],
    });

    service = TestBed.inject(ApiCallerService);
    httpMock = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getDefaultApiUrl', () => {
    const result = service.getDefaultApiUrl();
    expect(result).toBe('/api/');
  });

  it('getTokenData', (done) => {
    const result = service.getTokenData();
    result.subscribe((value) => {
      expect(value).toBe('custom injected token');
      done();
    });
  });

  it('getErrorHandler', () => {
    console.error = jest.fn();
    const result = service.getErrorHandler();
    result({
      request: null as unknown as ApiCallItem,
      response: {
        status: 409,
        headers: null as unknown as HttpHeaders,
        ok: false,
        statusText: '',
        type: HttpEventType.Response,
        url: '',
      },
    });
    expect(console.error).toBeCalledWith('Handled in CustomApiConnector');
  });

  it('getApiCallPayload', () => {
    let result;

    result = service.getApiCallPayload({
      path: '/test-path/',
    });
    expect(result).toEqual({
      payload: {
        api: '/api/',
        path: '/test-path/',
      },
    });

    result = service.getApiCallPayload({
      api: 'http://test-api/',
      path: 'test-path/',
    });
    expect(result).toEqual({
      payload: {
        api: 'http://test-api/',
        path: 'test-path/',
      },
    });
  });

  it('createApiResults', (done) => {
    const result = service.createApiResults({
      apiCallItem: {
        path: '/',
      }
    });
    result.data$.subscribe((v) => {
      expect(v).toEqual(null);
      done();
    });
  });

  it('makeHeaders', () => {
    const headers = new HttpHeaders();

    const options: SimplifiedHttpOptions = {};
    let result: HttpHeaders;

    result = service.makeHeaders(
      {
        path: '/',
      },
      null as unknown as SimplifiedHttpOptions,
    );
    expect(result).toEqual(headers);
    expect(result.get('Content-Type')).toEqual(null);

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
      },
      null as unknown as SimplifiedHttpOptions,
    );
    expect(console.warn).toBeCalledWith(
      '[@deejayy/api-caller] No file selected for upload but binaryUpload field name is set',
    );

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
        payload: [new Blob()],
      },
      options,
    );
    expect(result.get('Content-Type')).toEqual('application/x-www-form-urlencoded');
    expect(JSON.stringify(options)).toEqual('{"body":{}}');
  });

  it('makeRequests GET', () => {
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('GET', 'http://localhost/', { body: undefined, observe: 'response' });
  });

  it('makeRequests binaryResponse', () => {
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
        binaryResponse: true,
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('GET', 'http://localhost/', {
      body: undefined,
      responseType: 'blob',
      observe: 'response',
    });
  });

  it('makeRequests POST (implicit)', () => {
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
        payload: { pay: 'load' },
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('POST', 'http://localhost/', {
      body: { pay: 'load' },
      observe: 'response',
    });
  });

  it('makeRequests DELETE', () => {
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
        method: 'DELETE',
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('DELETE', 'http://localhost/', { body: undefined, observe: 'response' });
  });

  it('makeRequests DELETE w/ payload', () => {
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
        method: 'DELETE',
        payload: { pay: 'load' },
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('DELETE', 'http://localhost/', {
      body: { pay: 'load' },
      observe: 'response',
    });
  });

  it('makeRequests needsAuth', () => {
    const headers = new HttpHeaders().set('Authorization', 'Bearer custom injected token');
    service
      .makeRequest({
        api: 'http://localhost',
        path: '/',
        needsAuth: true,
      })
      .subscribe();
    expect(httpMock.request).toBeCalledWith('GET', 'http://localhost/', {
      body: undefined,
      headers: headers,
      observe: 'response',
    });
  });

  it('handleError', () => {
    console.error = jest.fn();
    service.handleError({
      request: null as unknown as ApiCallItem,
      response: {
        status: 410,
        headers: null as unknown as HttpHeaders,
        ok: false,
        statusText: '',
        type: HttpEventType.Response,
        url: '',
      },
    });
    expect(console.error).toBeCalledWith('Handled in CustomApiConnector');
  });

  it('handleError with local error handling', () => {
    console.error = jest.fn();
    const result = service.handleError({
      request: { path: undefined as unknown as string, localErrorHandling: true },
      response: {
        status: 410,
        headers: null as unknown as HttpHeaders,
        ok: false,
        statusText: '',
        type: HttpEventType.Response,
        url: '',
      },
    });
    expect(result).toEqual('Handled locally');
  });
});
