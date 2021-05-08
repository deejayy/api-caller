import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ApiCallItem } from '../model/api-call-item.model';
import { apiStateId } from '../model/api-state-id';
import { ApiState, ApiSubState, initialApiCallerState } from './api.state';

export const getStateId = (payload: ApiCallItem) => `${payload.api}${payload.path}`;

const getApiState = createFeatureSelector<ApiSubState>(apiStateId);
const getApiSubState = (stateId: string) => createSelector(getApiState, (state: ApiSubState) =>
  state && state[stateId]
    ? state[stateId]
    : initialApiCallerState,
);

export class ApiSelectors {
  public static isLoading = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.loading);
  public static getResponse = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.data);
  public static getErrorData = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.errorData);
  public static isFailed = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.error);
  public static isSucceeded = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.success);
  public static isCached = (stateId: string, cacheTimeout?: number) => createSelector(getApiSubState(stateId), (state: ApiState) => {
    if (state.returned && cacheTimeout) {
      if (new Date().getTime() - state.returned.getTime() > cacheTimeout) {
        return false;
      }
    }
    return state.data !== undefined && state.data !== null;
  });
}
