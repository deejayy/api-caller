import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jest-marbles';

import { ApiCallItem } from '../model/api-call-item.model';
import { ApiSelectors, getStateId } from './api.selectors';
import { initialApiCallerState } from './api.state';

const CACHE_TIMEOUT = 1000;

// eslint-disable-next-line max-lines-per-function
describe('ApiSelectors', () => {
  let store: MockStore;
  const initialState = { '@deejayy/api-caller': { '//': initialApiCallerState } };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore({ initialState })],
    });

    store = TestBed.inject(MockStore);
  });

  it('test getStateId', () => {
    let result = getStateId({
      api: '/',
      path: '/',
    });
    expect(result).toEqual('//');

    result = getStateId({} as ApiCallItem);
    expect(result).toEqual('undefined');

    result = getStateId({ api: '/' } as ApiCallItem);
    expect(result).toEqual('/undefined');

    result = getStateId({ path: '/' } as ApiCallItem);
    expect(result).toEqual('/');
  });

  it('test selector: null state', () => {
    store.setState({});
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isLoading('//'))).toBeObservable(expected);
  });

  it('test selector: isLoading false', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isLoading('//'))).toBeObservable(expected);
  });

  it('test selector: isLoading true', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState, loading: true } } });
    const expected = cold('a', { a: true });
    expect(store.select(ApiSelectors.isLoading('//'))).toBeObservable(expected);
  });

  it('test selector: getResponse initial', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: null });
    expect(store.select(ApiSelectors.getResponse('//'))).toBeObservable(expected);
  });

  it('test selector: getResponse with data', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState, data: 'data' } } });
    const expected = cold('a', { a: 'data' });
    expect(store.select(ApiSelectors.getResponse('//'))).toBeObservable(expected);
  });

  it('test selector: getErrorData initial', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: new HttpErrorResponse({ headers: new HttpHeaders() }) });
    expect(store.select(ApiSelectors.getErrorData('//'))).toBeObservable(expected);
  });

  it('test selector: getErrorData with data', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState, errorData: 'data' } } });
    const expected = cold('a', { a: 'data' });
    expect(store.select(ApiSelectors.getErrorData('//'))).toBeObservable(expected);
  });

  it('test selector: isFailed initial', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isFailed('//'))).toBeObservable(expected);
  });

  it('test selector: isFailed with data', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState, error: true } } });
    const expected = cold('a', { a: true });
    expect(store.select(ApiSelectors.isFailed('//'))).toBeObservable(expected);
  });

  it('test selector: isSucceeded initial', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isSucceeded('//'))).toBeObservable(expected);
  });

  it('test selector: isSucceeded with data', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState, success: true } } });
    const expected = cold('a', { a: true });
    expect(store.select(ApiSelectors.isSucceeded('//'))).toBeObservable(expected);
  });

  it('test selector: isCached initial', () => {
    store.setState({ '@deejayy/api-caller': { '//': { ...initialApiCallerState } } });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isCached('//'))).toBeObservable(expected);
  });

  it('test selector: isCached with data', () => {
    store.setState({
      '@deejayy/api-caller': { '//': { ...initialApiCallerState, returned: new Date(), data: 'data' } },
    });
    const expected = cold('a', { a: true });
    expect(store.select(ApiSelectors.isCached('//', CACHE_TIMEOUT))).toBeObservable(expected);
  });

  it('test selector: isCached with data, timed out', () => {
    store.setState({
      '@deejayy/api-caller': {
        '//': { ...initialApiCallerState, returned: new Date(new Date().getTime() - CACHE_TIMEOUT - 1), data: 'data' },
      },
    });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isCached('//', CACHE_TIMEOUT))).toBeObservable(expected);
  });

  it('test selector: isCached with data, no data', () => {
    store.setState({
      '@deejayy/api-caller': {
        '//': { ...initialApiCallerState, returned: new Date(new Date().getTime()) },
      },
    });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isCached('//', CACHE_TIMEOUT))).toBeObservable(expected);
  });

  it('test selector: isCached with data, null data', () => {
    store.setState({
      '@deejayy/api-caller': {
        '//': { ...initialApiCallerState, returned: new Date(new Date().getTime()), data: null },
      },
    });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isCached('//', CACHE_TIMEOUT))).toBeObservable(expected);
  });

  it('test selector: isCached with data, undefined data', () => {
    store.setState({
      '@deejayy/api-caller': {
        '//': { ...initialApiCallerState, returned: new Date(new Date().getTime()), data: undefined },
      },
    });
    const expected = cold('a', { a: false });
    expect(store.select(ApiSelectors.isCached('//', CACHE_TIMEOUT))).toBeObservable(expected);
  });
});
