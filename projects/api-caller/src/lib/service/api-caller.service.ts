import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { Payload } from '../helper/payload.model';
import { ApiCallItem, ApiInterface, SimplifiedHttpOptions } from '../model/api-call-item.model';
import { apiStateId } from '../model/api-state-id';
import { ApiActions } from '../store/api.actions';
import { ApiSelectors, getStateId } from '../store/api.selectors';
import { ApiResultState, ApiState } from '../store/api.state';
import { ApiConnector } from './api-connector';

@Injectable()
export class ApiCallerService {
  public tokenData$: Observable<string> = of(
    `[${apiStateId}] Can't send requests with authorization, token provider not found`,
  );

  public defaultApiUrl: string = '/';
  public errorHandler: (payload: ApiInterface) => void = (payload: ApiInterface) => {
    console.warn(`[${apiStateId}] Unhandled API error occurred, code: ${payload.response.status}`);
  };

  constructor(
    private http: HttpClient,
    private store: Store<ApiState>,
    @Optional() private apiConnector?: ApiConnector,
  ) {
    if (!this.apiConnector) {
      console.warn(`[${apiStateId}] apiConnector not provided, check README.md`);
    } else {
      this.tokenData$ = this.getTokenData();
      this.defaultApiUrl = this.getDefaultApiUrl();
      this.errorHandler = this.getErrorHandler();
    }
  }

  public getDefaultApiUrl(): string {
    return this.apiConnector?.defaultApiUrl ?? this.defaultApiUrl;
  }

  public getTokenData(): Observable<string> {
    return this.apiConnector?.tokenData$ ?? this.tokenData$;
  }

  public getErrorHandler(): (payload: ApiInterface) => void {
    return this.apiConnector?.errorHandler ?? this.errorHandler;
  }

  public handleError(payload: ApiInterface) {
    if (!payload.request?.localErrorHandling) {
      return this.getErrorHandler()(payload);
    }

    return 'Handled locally';
  }

  public getApiCallPayload(apiCallItem: ApiCallItem): Payload<ApiCallItem> {
    return {
      payload: {
        ...apiCallItem,
        api: apiCallItem.api ?? this.getDefaultApiUrl(),
      },
    };
  }

  public callApi<ResponseType>(apiCallItem: ApiCallItem): ApiResultState<ResponseType> {
    // Workaround to avoid "TypeError: Cannot freeze" error, native primitives (like FileList) cannot be passed to the state manager
    // See: https://stackoverflow.com/a/53092520
    if (apiCallItem.binaryUpload) {
      apiCallItem.payload =
        apiCallItem.payload && apiCallItem.payload.length > 0 ? { ...apiCallItem.payload } : undefined;
    }
    this.store.dispatch(ApiActions.ApiGet(this.getApiCallPayload(apiCallItem)));
    return this.createApiResults<ResponseType>(apiCallItem);
  }

  public resetApi(apiCallItem: ApiCallItem) {
    this.store.dispatch(ApiActions.ApiClearState(this.getApiCallPayload(apiCallItem)));
  }

  public resetAllApi() {
    this.store.dispatch(ApiActions.ApiClearAllState());
  }

  public createApiResults<ResponseType>(apiCallItem: ApiCallItem): ApiResultState<ResponseType> {
    const stateId = getStateId(this.getApiCallPayload(apiCallItem).payload);
    return {
      loading$: this.store.pipe(select(ApiSelectors.isLoading(stateId))),
      data$: this.store.pipe(select(ApiSelectors.getResponse(stateId))),
      errorData$: this.store.pipe(select(ApiSelectors.getErrorData(stateId))),
      error$: this.store.pipe(select(ApiSelectors.isFailed(stateId))),
      success$: this.store.pipe(select(ApiSelectors.isSucceeded(stateId))),
      finished$: this.store.pipe(select(ApiSelectors.isFinished(stateId))),
      headers$: this.store.pipe(select(ApiSelectors.getHeaders(stateId))),
    };
  }

  // eslint-disable-next-line complexity
  public makeHeaders(call: ApiCallItem, options: SimplifiedHttpOptions) {
    let headers = new HttpHeaders();

    if (call.binaryUpload) {
      if (call.payload) {
        const formData: FormData = new FormData();
        formData.append(call.binaryUpload, call.payload[0] as Blob);
        options.body = formData;
      } else {
        console.warn(`[${apiStateId}] No file selected for upload but binaryUpload field name is set`);
      }
    }

    if (call.payloadType === 'urlEncoded') {
      headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
      const encodedData = Object.keys(call.payload as Record<string, unknown>)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              (call.payload as Record<string, unknown>)[key] as string,
            )}`,
        )
        .join('&');
      options.body = encodedData;
    }

    if (call.payloadType === 'formData') {
      const formData = new FormData();
      Object.keys(call.payload as Record<string, unknown>).forEach((key) =>
        formData.append(key, (call.payload as Record<string, unknown>)[key] as string),
      );
      options.body = formData;
    }

    if (call.extraHeaders && Object.keys(call.extraHeaders).length > 0) {
      Object.keys(call.extraHeaders).forEach((key) => {
        if (call.extraHeaders?.[key] !== undefined) {
          headers.append(key, call.extraHeaders[key]!);
        }
      });
    }

    return headers;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, complexity
  public makeRequest(call: ApiCallItem): Observable<HttpResponse<any>> {
    const method = call.method ?? (call.payload ? 'POST' : 'GET');
    const { api } = call;
    const url = `${api ?? ''}${call.path}`;
    const options: SimplifiedHttpOptions = { body: call.payload, observe: 'response' };
    const headers = this.makeHeaders(call, options);

    if (call.binaryResponse) {
      options.responseType = 'blob';
    }

    if (call.sendCookies) {
      options.withCredentials = true;
    }

    if (call.needsAuth) {
      return this.getTokenData().pipe(
        take(1),
        mergeMap((token) => {
          options.headers = headers.set('Authorization', `Bearer ${token}`);
          return this.http.request(method, url, options);
        }),
      );
    }

    return this.http.request(method, url, options);
  }
}
