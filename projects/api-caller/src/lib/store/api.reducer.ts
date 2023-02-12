import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { createReducer } from '@ngrx/store';
import { Draft } from 'immer';

import { Payload } from '../helper/payload.model';
import { produceOn } from '../helper/produce-on';
import { ApiCallItem, ApiInterface } from '../model/api-call-item.model';
import { ApiActions } from './api.actions';
import { getStateId } from './api.selectors';
import { GlobalApiState, initialApiCallerGlobalState, initialApiCallerState } from './api.state';

export const apiGet = (draft: Draft<GlobalApiState>, action: Payload<ApiCallItem>) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = {
    ...(draft[stateId] ?? initialApiCallerState),
    loading: true,
    error: false,
    success: false,
    fired: new Date(),
  };
};

export const apiGetSuccess = (draft: Draft<GlobalApiState>, action: ApiInterface) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] ?? initialApiCallerState),
    loading: false,
    error: false,
    success: true,
    returned: new Date(),
    headers: action.headers,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: (action.response as HttpResponse<any>).body,
  };
};

export const apiGetFail = (draft: Draft<GlobalApiState>, action: ApiInterface) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] ?? initialApiCallerState),
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
    ...(draft[stateId] ?? initialApiCallerState),
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

export const apiReducer = createReducer(
  initialApiCallerGlobalState,
  produceOn(ApiActions.ApiGet, apiGet),
  produceOn(ApiActions.ApiGetSuccess, apiGetSuccess),
  produceOn(ApiActions.ApiGetFail, apiGetFail),
  produceOn(ApiActions.ApiGetFromCache, apiGetFromCache),
  produceOn(ApiActions.ApiClearState, apiClearState),
  produceOn(ApiActions.ApiClearAllState, apiClearAllState),
);
