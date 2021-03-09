import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, take } from 'rxjs/operators';

import { ApiCallerService } from '../service/api-caller.service';
import { ApiActions } from './api.actions';
import { ApiSelectors, getStateId } from './api.selectors';
import { ApiState } from './api.state';

@Injectable()
export class ApiEffects {
  public getApi$: Observable<ApiActions> = createEffect(() =>
    this.actions$.pipe(
      ofType(ApiActions.ApiGet),
      mergeMap(({ payload }) => {
        const stateId = getStateId(payload);
        return this.store
          .pipe(select(ApiSelectors.isCached(stateId, payload.cacheTimeout)))
          .pipe(
            take(1),
            mergeMap((isCached: boolean) => {
              if (payload.useCache && isCached) {
                return of(ApiActions.ApiGetFromCache({ payload }));
              } else {
                return this.apiService.makeRequest(payload).pipe(
                  map((data: object) =>
                    ApiActions.ApiGetSuccess({
                      request: payload,
                      response: data,
                    })
                  ),
                  catchError((error: HttpErrorResponse) =>
                    of(
                      ApiActions.ApiGetFail({
                        request: payload,
                        response: error,
                      })
                    )
                  )
                );
              }
            })
          );
      })
    )
  );

  public getApiFail$: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(ApiActions.ApiGetFail),
      map((action) => this.apiService.handleError(action))
    )
  );

  constructor(
    private actions$: Actions,
    private apiService: ApiCallerService,
    private store: Store<ApiState>
  ) {}
}
