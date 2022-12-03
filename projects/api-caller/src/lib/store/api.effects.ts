import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, take } from 'rxjs/operators';

import { ApiCallItem } from '../model/api-call-item.model';
import { ApiCallerService } from '../service/api-caller.service';
import { ApiActions } from './api.actions';
import { ApiSelectors, getStateId } from './api.selectors';
import { ApiState } from './api.state';

@Injectable()
export class ApiEffects {
  private parseHeaders(response: HttpResponse<any>): Record<string, string> {
    return response.headers
      .keys()
      .map((key) => {
        return { [key]: response.headers.get(key) || '' };
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }));
  }

  public handleSuccess(request: ApiCallItem) {
    return (response: HttpResponse<any>) => {
      return ApiActions.ApiGetSuccess({ request, response, headers: this.parseHeaders(response) });
    };
  }

  public handleError(request: ApiCallItem) {
    return (response: HttpResponse<any>) =>
      of(ApiActions.ApiGetFail({ request, response, headers: this.parseHeaders(response) }));
  }

  public mergeWithCache(request: ApiCallItem) {
    return (isCached: boolean) => {
      return request.useCache && isCached
        ? of(ApiActions.ApiGetFromCache({ payload: request }))
        : this.apiService
            .makeRequest(request)
            .pipe(map(this.handleSuccess(request)), catchError(this.handleError(request)));
    };
  }

  public getApiEffect = ({ payload }: { payload: ApiCallItem }) => {
    const stateId = getStateId(payload);
    return this.store
      .pipe(select(ApiSelectors.isCached(stateId, payload.cacheTimeout)))
      .pipe(take(1), mergeMap(this.mergeWithCache(payload)));
  };

  public getApi$: Observable<ApiActions> = createEffect(() =>
    this.actions$.pipe(ofType(ApiActions.ApiGet), mergeMap(this.getApiEffect)),
  );

  public getApiFail$: Observable<void | string> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ApiActions.ApiGetFail),
        map((action) => this.apiService.handleError(action)),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private apiService: ApiCallerService, private store: Store<ApiState>) {}
}
