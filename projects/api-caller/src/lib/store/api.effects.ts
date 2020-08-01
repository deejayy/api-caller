import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { ApiCallerService } from '../service/api-caller.service';
import { ApiActions, ApiActionTypes, ApiGet, ApiGetSuccess, ApiGetFail, ApiGetFromCache } from './api.actions';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, take } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { isCached, getStateId } from './api.selectors';
import { ApiState } from './api.state';

@Injectable()
export class ApiEffects {
  @Effect()
  public getApi$: Observable<ApiActions> = this.actions$.pipe(
    ofType(ApiActionTypes.API_GET),
    mergeMap(({ payload }: ApiGet) => {
      const stateId = getStateId(payload);
      return this.store.pipe(select(isCached(stateId))).pipe(
        take(1),
        mergeMap((isCached: boolean) => {
          if (payload.useCache && isCached) {
            return of(new ApiGetFromCache(payload));
          } else {
            return this.apiService.makeRequest(payload).pipe(
              map((data: object) => new ApiGetSuccess({ request: payload, response: data })),
              catchError((error: HttpErrorResponse) => of(new ApiGetFail({ request: payload, response: error })))
            );
          }
        })
      )
    })
  );

  @Effect({ dispatch: false })
  public getApiFail$: Observable<ApiGetFail> = this.actions$.pipe(
    ofType(ApiActionTypes.API_GET_FAIL),
    map((action: ApiGetFail) => this.apiService.handleError(action.payload))
  );

  constructor(
    private actions$: Actions,
    private apiService: ApiCallerService,
    private store: Store<ApiState>,
  ) {}
}
