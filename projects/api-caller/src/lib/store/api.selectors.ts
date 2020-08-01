import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ApiState, ApiSubState, initialApiCallerState } from './api.state';
import { apiStateId } from '../model/api-state-id';
import { ApiCallItem } from '../model/api-call-item.model';

export const getStateId = (payload: ApiCallItem) => `${payload.api}${payload.path}`;

export const getApiState = createFeatureSelector<ApiSubState>(apiStateId);
export const getApiSubState = (stateId: string) => createSelector(getApiState, (state: ApiSubState) => state[stateId] || initialApiCallerState);

export const isLoading = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.loading);
export const getResponse = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.data);
export const getErrorData = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.errorData);
export const isFailed = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.error);
export const isSucceeded = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.success);
export const isCached = (stateId: string) => createSelector(getApiSubState(stateId), (state: ApiState) => state.data !== undefined && state.data !== null);
