import * as actionReducers from './api.reducer';

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
    });
    expect(draft).toEqual({
      '//': {
        data: undefined,
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
    });
    expect(draft).toEqual({
      '//': {
        data: null,
        errorData: undefined,
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
        errorData: 'test errorData',
        returned: 'test returned',
        loading: 'test loading',
        error: 'test error',
        success: 'test success',
        fired: 'test fired',
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
        errorData: 'test errorData',
        returned: 'test returned',
        loading: true,
        error: false,
        success: false,
        fired: new Date(),
      },
    });
  });

  it('test apiGetSuccess, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: 'test errorData',
        returned: 'test returned',
        loading: 'test loading',
        error: 'test error',
        success: 'test success',
        fired: 'test fired',
      },
    };
    actionReducers.apiGetSuccess(draft, {
      request: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: undefined,
        errorData: 'test errorData',
        fired: 'test fired',
        loading: false,
        error: false,
        success: true,
        returned: new Date(),
      },
    });
  });

  it('test apiGetFail, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: 'test errorData',
        returned: 'test returned',
        loading: 'test loading',
        error: 'test error',
        success: 'test success',
        fired: 'test fired',
      },
    };
    actionReducers.apiGetFail(draft, {
      request: {
        api: '/',
        path: '/',
      },
    });
    expect(draft).toEqual({
      '//': {
        data: 'test data',
        errorData: undefined,
        fired: 'test fired',
        loading: false,
        error: true,
        success: false,
        returned: new Date(),
      },
    });
  });

  it('test apiGetFromCache, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: 'test errorData',
        returned: 'test returned',
        loading: 'test loading',
        error: 'test error',
        success: 'test success',
        fired: 'test fired',
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
        errorData: 'test errorData',
        returned: 'test returned',
        loading: false,
        error: false,
        success: true,
        fired: 'test fired',
      },
    });
  });

  it('test apiClearState, with preset state', () => {
    const draft = {
      '//': {
        data: 'test data',
        errorData: 'test errorData',
        returned: 'test returned',
        loading: 'test loading',
        error: 'test error',
        success: 'test success',
        fired: 'test fired',
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
