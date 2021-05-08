/* eslint-disable max-lines-per-function */
import { HttpEventType, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { SimplifiedHttpOptions } from '../model/api-call-item.model';

import { ApiEffects } from '../store/api.effects';
import { apiReducer } from '../store/api.reducer';
import { ApiCallerService } from './api-caller.service';
import { ApiConnector } from './api-connector';

class CustomApiConnector extends ApiConnector {
  public defaultApiUrl = '/api/';
  public errorHandler = () => {
    console.error('Handled in CustomApiConnector');
  };
  public tokenData$ = of('custom injected token');
}

describe('ApiCallerService', () => {
  let service: ApiCallerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot([apiReducer]), EffectsModule.forRoot([ApiEffects])],
      providers: [ApiCallerService],
    });

    service = TestBed.inject(ApiCallerService);
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
      request: null,
      response: { status: 409, headers: null, ok: false, statusText: '', type: HttpEventType.Response, url: '' },
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
      path: '/',
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
      null,
    );
    expect(result).toEqual(headers);
    expect(result.get('Content-Type')).toEqual(null);

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
      },
      null,
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

  it('makeRequest GET', (done) => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
    });
    result.subscribe((v) => {
      expect(v).toEqual({ flushed: true });
      done();
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('GET');
    req.flush({ flushed: true });
  });

  it('makeRequest DELETE', (done) => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
      method: 'DELETE',
    });
    result.subscribe((v) => {
      expect(v).toEqual({ flushed: true });
      done();
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('DELETE');
    req.flush({ flushed: true });
  });

  it('makeRequest POST (implicit)', (done) => {
    const result = service.makeRequest({
      api: 'http://localhost',
      path: '/',
      payload: {},
    });
    result.subscribe((v) => {
      expect(v).toEqual({ flushed: true });
      done();
    });
    const req = httpMock.expectOne('http://localhost/');
    expect(req.request.method).toEqual('POST');
    req.flush({ flushed: true });
  });
});

describe('ApiCallerService with Connector', () => {
  let service: ApiCallerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot([apiReducer]), EffectsModule.forRoot([ApiEffects])],
      providers: [ApiCallerService, { provide: ApiConnector, useClass: CustomApiConnector }],
    });

    service = TestBed.inject(ApiCallerService);
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
      request: null,
      response: { status: 409, headers: null, ok: false, statusText: '', type: HttpEventType.Response, url: '' },
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
      path: '/',
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
      null,
    );
    expect(result).toEqual(headers);
    expect(result.get('Content-Type')).toEqual(null);

    console.warn = jest.fn();
    result = service.makeHeaders(
      {
        path: '/',
        binaryUpload: 'field',
      },
      null,
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
});
