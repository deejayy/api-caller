import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import * as actionReducers from './api.reducer';
import { GlobalApiState } from './api.state';

jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime());

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
        errorData: null,
        returned: null,
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
      response: null,
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: null,
        fired: null,
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
      response: null,
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: null,
        fired: null,
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
        errorData: null,
        returned: null,
        loading: false,
        error: false,
        success: true,
        fired: null,
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
        errorData: null,
        returned: null,
        loading: false,
        error: false,
        success: false,
        fired: null,
      },
    });
  });

  it('test apiGet, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
        returned: new Date(),
        loading: false,
        error: true,
        success: true,
        fired: null,
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
        fired: null,
        loading: true,
        error: true,
        success: false,
        returned: null,
      },
    };
    actionReducers.apiGetSuccess(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: { data: 1 } as unknown as HttpResponseBase,
    });
    expect(draft).toEqual({
      '//': {
        fired: null,
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
        fired: null,
        loading: true,
        error: false,
        success: true,
        returned: null,
      },
    };
    actionReducers.apiGetFail(draft, {
      request: {
        api: '/',
        path: '/',
      },
      response: new HttpErrorResponse({ headers: undefined, status: 801 }),
    });
    expect(draft).toEqual({
      '//': {
        data: 'test data',
        errorData: new HttpErrorResponse({ headers: undefined, status: 801 }),
        fired: null,
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
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
        errorData: new HttpErrorResponse({ headers: undefined, status: 800 }),
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
        errorData: null,
        returned: null,
        loading: false,
        error: false,
        success: false,
        fired: null,
      },
    });
  });

  it('test apiClearAllState', () => {
    expect(actionReducers.apiClearAllState()).toEqual({});
  });
});
