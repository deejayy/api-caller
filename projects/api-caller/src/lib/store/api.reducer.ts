import { Action, createReducer } from '@ngrx/store';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Draft } from 'immer';

import { produceOn } from '../helper/produce-on';
import { Payload } from '../helper/payload.model';
import { ApiCallItem } from '../model/api-call-item.model';
import { ApiInterface } from '../model/api-call-item.model';
import { ApiActions } from './api.actions';
import { getStateId } from './api.selectors';
import { ApiState, initialApiCallerState, initialApiCallerGlobalState, GlobalApiState } from './api.state';

export const apiGet = (draft: Draft<GlobalApiState>, action: Payload<ApiCallItem>) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: true,
    error: false,
    success: false,
    fired: new Date(),
  };
};

export const apiGetSuccess = (draft: Draft<GlobalApiState>, action: ApiInterface) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: false,
    success: true,
    returned: new Date(),
    headers: action.headers,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: (action.response as HttpResponse<any>)?.body,
  };
};

export const apiGetFail = (draft: Draft<GlobalApiState>, action: ApiInterface) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: true,
    success: false,
    returned: new Date(),
    headers: action.headers,
    errorData: action.response as HttpErrorResponse,
  };
};

export const apiGetFromCache = (draft: Draft<GlobalApiState>, action: Payload<ApiCallItem>) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: false,
    success: true,
  };
};

export const apiClearState = (draft: Draft<GlobalApiState>, action: Payload<ApiCallItem>) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = initialApiCallerState;
};

export const apiClearAllState = () => ({});

const reducer = createReducer(
  initialApiCallerGlobalState,
  produceOn(ApiActions.ApiGet, apiGet),
  produceOn(ApiActions.ApiGetSuccess, apiGetSuccess),
  produceOn(ApiActions.ApiGetFail, apiGetFail),
  produceOn(ApiActions.ApiGetFromCache, apiGetFromCache),
  produceOn(ApiActions.ApiClearState, apiClearState),
  produceOn(ApiActions.ApiClearAllState, apiClearAllState),
);

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function apiReducer(state: GlobalApiState, action: Action): ApiState | unknown {
  return reducer(state, action);
}
