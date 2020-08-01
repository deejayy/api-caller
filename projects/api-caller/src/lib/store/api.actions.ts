import { Action } from '@ngrx/store';
import { ApiCallItem, ApiInterface } from '../model/api-call-item.model';

export enum ApiActionTypes {
  API_GET = '[API] Get',
  API_GET_SUCCESS = '[API] Get Success',
  API_GET_FAIL = '[API] Get Fail',
  API_GET_FROM_CACHE = '[API] Get From Cache',
}

export class ApiGet implements Action {
  public readonly type = ApiActionTypes.API_GET;
  constructor(public payload: ApiCallItem) {}
}

export class ApiGetSuccess implements Action {
  public readonly type = ApiActionTypes.API_GET_SUCCESS;
  constructor(public payload: ApiInterface) {}
}

export class ApiGetFromCache implements Action {
  public readonly type = ApiActionTypes.API_GET_FROM_CACHE;
  constructor(public payload: ApiCallItem) {}
}

export class ApiGetFail implements Action {
  public readonly type = ApiActionTypes.API_GET_FAIL;
  constructor(public payload: ApiInterface) {}
}

export type ApiActions = ApiGet | ApiGetSuccess | ApiGetFail | ApiGetFromCache;
