import { HttpErrorResponse, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import * as actionReducers from './api.reducer';
import { GlobalApiState } from './api.state';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());

// eslint-disable-next-line max-lines-per-function
describe('ApiRedicer', () => {
  it('test apiGet', () => {
    const draft = {};
    actionReducers.apiGet(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: new HttpErrorResponse({}),
        headers: {},
        returned: undefined,
        loading: true,
        error: false,
        success: false,
        fired: new Date(),
      },
    });
  });

  it('test apiGetSuccess', () => {
    const draft = {};
    actionReducers.apiGetSuccess(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: null as unknown as HttpResponseBase,
      headers: {},
    });
    expect(draft).toEqual({
      '//': {
        data: undefined,
        errorData: new HttpErrorResponse({}),
        headers: {},
        fired: undefined,
        loading: false,
        error: false,
        success: true,
        returned: new Date(),
      },
    });
  });

  it('test apiGetFail', () => {
    const draft = {};
    actionReducers.apiGetFail(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: null as unknown as HttpResponseBase,
      headers: {},
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: null,
        headers: {},
        fired: undefined,
        loading: false,
        error: true,
        success: false,
        returned: new Date(),
      },
    });
  });

  it('test apiGetFromCache', () => {
    const draft = {};
    actionReducers.apiGetFromCache(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: new HttpErrorResponse({}),
        headers: {},
        returned: undefined,
        loading: false,
        error: false,
        success: true,
        fired: undefined,
      },
    });
  });

  it('test apiClearState', () => {
    const draft = {};
    actionReducers.apiClearState(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: new HttpErrorResponse({}),
        headers: {},
        returned: undefined,
        loading: false,
        error: false,
        success: false,
        fired: undefined,
      },
    });
  });

  it('test apiGet, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        returned: new Date(),
        loading: false,
        error: true,
        success: true,
        fired: undefined,
      },
    };
    actionReducers.apiGet(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        returned: new Date(),
        loading: true,
        error: false,
        success: false,
        fired: new Date(),
      },
    });
  });

  it('test apiGetSuccess, with preset state', () => {
    const draft: GlobalApiState = {
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        fired: undefined,
        loading: true,
        error: true,
        success: false,
        returned: undefined,
      },
    };
    actionReducers.apiGetSuccess(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: new HttpResponse({ body: { data: 1 } }),
      headers: {},
    });
    expect(draft).toEqual({
      '//': {
        fired: undefined,
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        loading: false,
        error: false,
        success: true,
        returned: new Date(),
        data: { data: 1 },
      },
    } as GlobalApiState);
  });

  it('test apiGetFail, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        fired: undefined,
        loading: true,
        error: false,
        success: true,
        returned: undefined,
      },
    };
    actionReducers.apiGetFail(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 801 }),
      headers: {},
    });
    expect(draft).toEqual({
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 801 }),
        headers: {},
        fired: undefined,
        loading: false,
        error: true,
        success: false,
        returned: new Date(),
      },
    } as GlobalApiState);
  });

  it('test apiGetFromCache, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        returned: new Date(),
        loading: true,
        error: true,
        success: false,
        fired: new Date(),
      },
    };
    actionReducers.apiGetFromCache(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        returned: new Date(),
        loading: false,
        error: false,
        success: true,
        fired: new Date(),
      },
    } as GlobalApiState);
  });

  it('test apiClearState, with preset state', () => {
    const draft = {
      '//': {
        data: 'data',
        errorData: new HttpErrorResponse({ headers: undefined as unknown as HttpHeaders, status: 800 }),
        headers: {},
        returned: new Date(),
        loading: true,
        error: true,
        success: true,
        fired: new Date(),
      },
    };
    actionReducers.apiClearState(draft, {
      payload: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: new HttpErrorResponse({}),
        headers: {},
        returned: undefined,
        loading: false,
        error: false,
        success: false,
        fired: undefined,
      },
    });
  });

  it('test apiClearAllState', () => {
    expect(actionReducers.apiClearAllState()).toEqual({});
  });
});
