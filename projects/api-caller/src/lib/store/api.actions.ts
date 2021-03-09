import { createAction, props } from '@ngrx/store';

import { ApiCallItem, ApiInterface } from '../model/api-call-item.model';

export class ApiActions {
  public static ApiGet = createAction('[API] Get', props<{ payload: ApiCallItem }>());
  public static ApiGetSuccess = createAction('[API] Get Success', props<ApiInterface>());
  public static ApiGetFail = createAction('[API] Get Fail', props<ApiInterface>());
  public static ApiGetFromCache = createAction('[API] Get From Cache', props<{ payload: ApiCallItem }>());
  public static ApiClearState = createAction('[API] Clear State', props<{ payload: ApiCallItem }>());
  public static ApiClearAllState = createAction('[API] Clear Full State');
}
