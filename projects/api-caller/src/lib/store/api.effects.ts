import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
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
  private handleSuccess(request: ApiCallItem) {
    return (response: HttpResponseBase) => ApiActions.ApiGetSuccess({ request, response });
  }

  private handleError(request: ApiCallItem) {
    return (response: HttpErrorResponse) => of(ApiActions.ApiGetFail({ request, response }));
  }

  private mergeWithCache(request: ApiCallItem) {
    return (isCached: boolean) => {
      return request.useCache && isCached
        ? of(ApiActions.ApiGetFromCache({ payload: request }))
        : this.apiService
            .makeRequest(request)
            .pipe(map(this.handleSuccess(request)), catchError(this.handleError(request)));
    };
  }

  private getApiEffect = ({ payload }) => {
    const stateId = getStateId(payload);
    return this.store
      .pipe(select(ApiSelectors.isCached(stateId, payload.cacheTimeout)))
      .pipe(take(1), mergeMap(this.mergeWithCache(payload)));
  };

  public getApi$: Observable<ApiActions> = createEffect(() =>
    this.actions$.pipe(ofType(ApiActions.ApiGet), mergeMap(this.getApiEffect)),
  );

  public getApiFail$: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ApiActions.ApiGetFail),
        map((action) => this.apiService.handleError(action)),
      ),
    { dispatch: false },
  );

  constructor(private actions$: Actions, private apiService: ApiCallerService, private store: Store<ApiState>) {}
}
