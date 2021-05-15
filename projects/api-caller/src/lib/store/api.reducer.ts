import { Action, createReducer } from '@ngrx/store';

import { produceOn } from '../helper/produce-on';
import { ApiActions } from './api.actions';
import { getStateId } from './api.selectors';
import { ApiState, initialApiCallerState } from './api.state';

export const apiGet = (draft, action) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: true,
    error: false,
    success: false,
    fired: new Date(),
  };
};

export const apiGetSuccess = (draft, action) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: false,
    success: true,
    returned: new Date(),
    data: action.response,
  };
};

export const apiGetFail = (draft, action) => {
  const stateId = getStateId(action.request);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: true,
    success: false,
    returned: new Date(),
    errorData: action.response,
  };
};

export const apiGetFromCache = (draft, action) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = {
    ...(draft[stateId] || initialApiCallerState),
    loading: false,
    error: false,
    success: true,
  };
};

export const apiClearState = (draft, action) => {
  const stateId = getStateId(action.payload);
  draft[stateId] = initialApiCallerState;
};

export const apiClearAllState = () => ({});

const reducer = createReducer(
  {},
  produceOn(ApiActions.ApiGet, apiGet),
  produceOn(ApiActions.ApiGetSuccess, apiGetSuccess),
  produceOn(ApiActions.ApiGetFail, apiGetFail),
  produceOn(ApiActions.ApiGetFromCache, apiGetFromCache),
  produceOn(ApiActions.ApiClearState, apiClearState),
  produceOn(ApiActions.ApiClearAllState, apiClearAllState),
);

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function apiReducer(state: ApiState, action: Action): ApiState | unknown {
  return reducer(state, action);
}
