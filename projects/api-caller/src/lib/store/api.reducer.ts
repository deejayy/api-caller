import { ApiState, initialApiCallerState } from './api.state';
import { ApiActions, ApiActionTypes } from './api.actions';
import { produce } from 'immer';
import { getStateId } from './api.selectors';

export function apiReducer(state: ApiState = initialApiCallerState, action: ApiActions): ApiState {
  return produce(state, (draft: ApiState) => {
    let stateId;
    switch (action.type) {
      case ApiActionTypes.API_GET:
        stateId = getStateId(action.payload);
        draft[stateId] = {
          ...(draft[stateId] || initialApiCallerState),
          loading: true,
        };
        break;

      case ApiActionTypes.API_GET_SUCCESS:
        stateId = getStateId(action.payload.request);
        draft[stateId] = {
          ...(draft[stateId] || initialApiCallerState),
          loading: false,
          error: false,
          success: true,
          data: action.payload.response,
        }
        break;

      case ApiActionTypes.API_GET_FROM_CACHE:
        stateId = getStateId(action.payload);
        draft[stateId] = {
          ...(draft[stateId] || initialApiCallerState),
          loading: false,
          error: false,
          success: true,
        }
        break;

      case ApiActionTypes.API_GET_FAIL:
        stateId = getStateId(action.payload.request);
        draft[stateId] = {
          ...(draft[stateId] || initialApiCallerState),
          loading: false,
          error: true,
          success: false,
          errorData: action.payload.response,
        }
        break;

      case ApiActionTypes.API_CLEAR_STATE:
        stateId = getStateId(action.payload);
        draft[stateId] = initialApiCallerState;
        break;
    }
  });
}
