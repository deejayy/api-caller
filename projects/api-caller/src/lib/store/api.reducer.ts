import { Action, createReducer } from '@ngrx/store';

import { produceOn } from '../helper/produce-on';
import { ApiActions } from './api.actions';
import { getStateId } from './api.selectors';
import { ApiState, initialApiCallerState } from './api.state';

const reducer = createReducer(
  {},
  produceOn(ApiActions.ApiGet, (draft, action) => {
    const stateId = getStateId(action.payload);
    draft[stateId] = {
      ...(draft[stateId] || initialApiCallerState),
      loading: true,
      fired: new Date(),
    };
  }),
  produceOn(ApiActions.ApiGetSuccess, (draft, action) => {
    const stateId = getStateId(action.request);
    draft[stateId] = {
      ...(draft[stateId] || initialApiCallerState),
      loading: false,
      error: false,
      success: true,
      returned: new Date(),
      data: action.response,
    }
  }),
  produceOn(ApiActions.ApiGetFail, (draft, action) => {
    const stateId = getStateId(action.request);
    draft[stateId] = {
      ...(draft[stateId] || initialApiCallerState),
      loading: false,
      error: true,
      success: false,
      returned: new Date(),
      errorData: action.response,
    }
  }),
  produceOn(ApiActions.ApiGetFromCache, (draft, action) => {
    const stateId = getStateId(action.payload);
    draft[stateId] = {
      ...(draft[stateId] || initialApiCallerState),
      loading: false,
      error: false,
      success: true,
    }
  }),
  produceOn(ApiActions.ApiClearState, (draft, action) => {
    const stateId = getStateId(action.payload);
    draft[stateId] = initialApiCallerState;
  }),
  produceOn(ApiActions.ApiClearAllState, () => ({})),
);

export function apiReducer(state: ApiState, action: Action): ApiState | {} {
  return reducer(state, action);
};
