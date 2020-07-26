import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import { ApiCallerService } from '../service/api-caller.service';
import { ApiActions, ApiActionTypes, ApiGet, ApiGetSuccess, ApiGetFail } from './api.actions';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class ApiEffects {
  @Effect()
  public getApi$: Observable<ApiActions> = this.actions$.pipe(
    ofType(ApiActionTypes.API_GET),
    mergeMap(({ payload }: ApiGet) =>
      this.apiService.makeRequest(payload).pipe(
        map((data: object) => new ApiGetSuccess({ request: payload, response: data })),
        catchError((error: HttpErrorResponse) => of(new ApiGetFail({ request: payload, response: error })))
      )
    )
  );

  @Effect({ dispatch: false })
  public getApiFail$: Observable<ApiGetFail> = this.actions$.pipe(
    ofType(ApiActionTypes.API_GET_FAIL),
    map((action: ApiGetFail) => this.apiService.handleError(action.payload))
  );

  constructor(
    private actions$: Actions,
    private apiService: ApiCallerService,
  ) {}
}
