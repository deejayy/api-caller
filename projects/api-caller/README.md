# Simple API caller library for Angular

This library helps you simplify and reduce the code required for making API calls from an Angular frontend application.

Based on NGRX state manager, provides a simple interface to set up an API call and retrieve the results (and other useful states as well).

## How to use?

```
npm install @ngrx/store @ngrx/effects immer
npm install @deejayy/api-caller
```

**Add these to your app.module.ts:**

**Angular 10 / api-caller v1**

```ts
imports: [
  ...
  StoreModule.forRoot({}),
  EffectsModule.forRoot(),
  ApiCallerModule,
],
```

**Angular 11 / api-caller v2** (`strictStateImmutability` should be set to false)

```ts
imports: [
  ...
  StoreModule.forRoot({}, {
    runtimeChecks: {
      strictStateImmutability: false
    },
  }),
  EffectsModule.forRoot(),
  ApiCallerModule,
],
```

**Start using:**

Pick the first meaningful result and forget about the rest.

```ts
this.apiCallerService
  .callApi<DataModel[]>({ api: 'https://endpoint-url/api/v1/', path: 'path/to/call' })
  .data$.pipe(
    filter((v: DataModel[]) => v?.length > 0),
    take(1),
  ).subscribe(
    (v: DataModel[]) => console.log(v[0]),
  );
```

-- or --

```ts
const apiCall = { api: 'https://endpoint-url/api/v1/', path: 'path/to/call' };
const result = this.apiCallerService.createApiResults(apiCall);
this.apiCallerService.callApi(apiCall);
result.data$.subscribe(console.log);
```

## Interface

### Input

Methods ```createApiResults<T>()```, ```callApi()``` and ```resetApi()``` need the same parameter to be supplied: an ```ApiCallItem``` type of object.

**`createApiResults<T>()` method**

Used for setting up a variable which will hold the observables selected from the state for a particular API call. Accepts a T type which later will assigned to data$ stream. See examples.

**`callApi()` method**

Used for firing an actual API call. The HTTP request itself is also controlled via the ```useCache``` attribute, depending on the cache it may not be fired.

**`resetApi()` method**

Used for resetting the states for a particular API call.

**`resetAllApi()` method**

Used for resetting the states for all of earlier fired API calls.

### ApiCallItem has the following properties

- ```api```: (optional) the base url of the endpoints you want to use, eg. ```https://endpoint-url/api/v1/```. Defaults to ```/```, but check [Advanced examples](#advanced-examples) on how to set a different default.
- ```path```: remaining part of the endpoint you want to call. It will be appended to the ```api``` property. Eg. ```path/to/call```
- ```payload```: (optional) a JSON object which should be sent to the endpoint. Note: the request method will be ```GET``` without (or with an empty) ```payload``` value and will be ```POST``` if a valid one is supplied. Method can be overridden by providing the ```method``` property (see below).
- ```method```: (optional) method is by default determined based on payload, but you can override the HTTP method with this property.
- ```needsAuth```: (optional) determines whether the call needs authorization. If this is set to true, you must supply a token ```Observable``` to the module at import (see [Advanced examples](#advanced-examples))
- ```useCache```: set this flag if you want to skip sending the backend request when there is a response already existing in the state
- ```cacheTimeout```: timeout for the cache in milliseconds, use in combination with ```useCache``` flag
- ```binaryUpload```: string type parameter where you should pass the field name what the backend requires to upload files
- ```binaryResponse```: if you know that the response will be a blob, set this to true
- ```localErrorHandling```: the service normally calls the error handler defined in the `ApiConnector`, but if you don't want it to be triggered, set this flag to true. In this case, you still have the error information in the `error$` and `errorData$` streams.

### Output

Outputs are essentially provided as streams which are returned in an ```ApiResultState<T>``` object. You can expect the following:

- ```data$```: most important observable, which will holds the response from the backend endpoint on a successful call, type T assigned with ```createApiResults<T>()``` method.
- ```errorData$```: if there were an error making the request, the ```HttpErrorResponse``` type of object will be in this observable
- ```loading$```: this state is set to ```true``` right before initiating an ```HttpClient``` request, and set to ```false``` when the call is finished (regardless of success or failure). Useful for displaying a loading spinner when this is true.
- ```success$```: boolean state returns true on successful call
- ```error$```: boolean state returns true on a failed call
- ```finished$```: boolean state returns true on a finished call (either success or error is set)

## Advanced examples

The ```ApiCallerService``` has an optional dependency, an ```ApiConnector``` service with which you can control a the service's behaviour.

### ApiConnector properties and methods

- ```tokenData$```: this should be an observable of a token (type: string) necessary for making authorized requests (check ```needsAuth``` property in ```ApiCallItem``` object). Currently the library only supports "Bearer" token in the "Authorization" HTTP header field.
- ```defaultApiUrl```: if you use a single API in most of the cases, you may want to set it as a service-scope variable, so you don't have to provide it for every single call you make. With this you have the opportinity to control the prod/test/dev API endpoints in a single place.
- ```errorHandler```: this should be a function which will be called whenever the API call is failing with an HTTP error. Useful for handling unathorized request (HTTP 4xx) in a single place. The function will receive an ```ApiInterface``` parameter.

### ApiInterface properties

- ```request```: an ```ApiCallItem``` object
- ```response```: response got back from the ```HttpClient``` request

### How to use ApiConnector

**Step 1. Create a service based on ApiConnector**

```ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { ApiConnector } from '@deejayy/api-caller';

@Injectable()
export class MyApiConnectorService extends ApiConnector {
  public tokenData$: Observable<string>;
  public defaultApiUrl = 'https://my-custom-api.com/';
  public errorHandler = (payload: any) => {
    console.log('handling... ', payload);
  }

  constructor(private authService: AuthService) {
    super();
    this.tokenData$ = this.authService.token$;
  }
}
```

**Step 2. Add this line to your app.module.ts ```providers``` array:**

```ts
providers: [
  { provide: ApiConnector, useClass: MyApiConnectorService }
],
```

## Tips and Tricks

### Create an API catalog

You may want to keep all types of API calls in a single place per app or feature module.

**api-catalog.ts**

```ts
export class LoginCall implements ApiCallItem {
  public path: string = '/users/login#LoginCall';
  constructor(public payload: LoginData = null) { }
}

export class LogoutCall implements ApiCallItem {
  public path: string = '/users/logout#LogoutCall';
  public needsAuth: boolean = true;
}

export class UploadCall implements ApiCallItem {
  public path: string = '/files/upload#UploadCall';
  public needsAuth: boolean = true;
  public binaryUpload: string = 'files[]';
  constructor(public payload: FileList) { }
}
```

Note the URI fragment (#LoginCall, #LogoutCall) at the end of the urls: with this, you can create unique states in the store and can call the same endpoint with different payloads or options. URI fragment is ignored by the HttpClient library, so your backend won't receive it.

In case you want to distinguish the calls in the dev console's "Network" tab and you are calling the same endpoint for different use cases, you may want to use query parameters, like ```'/users/login?subsystem=something#LoginCall';```.

**user.service.ts**

```ts
public login() {
  const apiCall = new LoginCall({ username: ..., password: ...});
  const result = this.apiCallerService.createApiResults(apiCall);
  result.data$.subscribe(console.log); // succesful login response

  this.apiCallerService.callApi(apiCall);
}

public logout() {
  const apiCall = new LogoutCall();
  const result = this.apiCallerService.createApiResults(apiCall);
  result.success$.subscribe(console.log); // if you care about the result, you can subscribe on the success boolean

  this.apiCallerService.callApi(apiCall);
}
```

### Use streams in the template

As api-caller is providing streams as the output of the calls, you can use them directly in the templates with ```async pipe```:

**user-form.component.ts**

```ts
public ngOnInit(): void {
  const apiCall = new LoginCall(); // note: we didn't passed any parameter to this, because the state identifier for login is not dependent on the payload, just the url + path
  this.loginState = this.apiCallerService.createApiResults(apiCall);
}

public login() {
  const apiCall = new LoginCall({ username: ..., password: ...});
  this.apiCallerService.callApi(apiCall);
}

public upload(fileControl: HTMLInputElement) {
  const apiCallUpload = new UploadCall(fileControl.files);
  this.apiCallerService.callApi(apiCallUpload);
}
```

**user-form.component.html**

```html
<div class="login">
  <app-spinner *ngIf="loginState.loading$ | async"></app-spinner>
  <div class="error" *ngIf="loginState.error$ | async">
    {{ (loginState.errorData$ | async).status }}
  </div>
  ...
  <input type="file" multiple #avatar>
  <button (click)="upload(avatar)">Upload avatar</button>
</div>
```

## Future plans

(vote with likes at [github issues](https://github.com/deejayy/api-caller/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement))

- ~**caching**: don't fire an http request if there is already a response in the state. [Issue#1](https://github.com/deejayy/api-caller/issues/1)~ (done [PR#9](https://github.com/deejayy/api-caller/pull/9))
- ~**clear/reset state**: whatever value is in the state, clear it (both data and error) [Issue#2](https://github.com/deejayy/api-caller/issues/2)~ (done)
- ~**binary uploading**: attach files as payload to a request [Issue#3](https://github.com/deejayy/api-caller/issues/3)~ (done)
- ~**binary downloading**: in the case when the backend is not responding with a JSON object but a binary blob (eg. a file to download) [Issue#4](https://github.com/deejayy/api-caller/issues/4)~ (done)
- ~**methods**: ability to change the HTTP method other than the automatically determined GET and POST~
- **custom auth method**: extend ApiConnector to provide authorization methods different from "Bearer" [Issue#5](https://github.com/deejayy/api-caller/issues/5)
- **additional headers**: if you want to pass additional headers to the requests, globally or occasionally [Issue#6](https://github.com/deejayy/api-caller/issues/6)
- **silent loading**: fire a request without changing the loading$ state, also introduce a new state which will anyway hold the fact that there is a request in progress [Issue#7](https://github.com/deejayy/api-caller/issues/7)
- **polling**: set an interval to regularly fetch backend response
- **append**: when a request is fired again, append the result to the previous response. Optional append logic method may be passed to it.
- **refresh in background**: if caching is turned on, do a re-fetch in the background, compare the result and update on change. Could receive an optional comparator function if the response is changing anyway (eg. sent timestamp). ```keepUpdated```

## Troubleshooting

Handled error messages you may bump into:

**[@deejayy/api-caller] apiConnector not provided, check README.md**

See [Advanced examples](#advanced-examples) section about how to configure the ```ApiConnector``` service.

**[@deejayy/api-caller] Unhandled API error occurred, code:**

This is an optional feature if you want to handle failed requests in a single place. Provide an ```errorHandler``` method in your ```ApiConnector``` service to catch these kind of errors (see [Advanced examples](#advanced-examples)). Eg. you can start a deauthenticate process on an HTTP 401.

**[@deejayy/api-caller] Unhandled API error occurred, code: 200**

Although HTTP 200 is not an error, this could mean that the response from the backend is not a valid JSON, therefore it will go to the error branch. You can obtain the repsonse and get rid of errors when HTTP 200 is the status with ```binaryResponse``` feature.

**Authorization: Bearer [@deejayy/api-caller] Can't send requests with authorization, token provider not found**

You missed the ```tokenData$``` observable from your ```ApiConnector``` service, check [Advanced examples](#advanced-examples) on how to do it.

**[@deejayy/api-caller] No file selected for upload but binaryUpload field name is set**

You accidentally forgot to pass the FileList object to the ApiCall but you set the binaryUpload field name. See [Advanced examples](#advanced-examples). The request will be fired regardless of you provided valid file(s) or not.

## Ideas or issues

Feel free to use the "Issues" section on github to tell me about anything you want to change.
You can also fork the repo or open a pull request with your ideas or change suggestions.

## Author

[DeeJayy](https://github.com/deejayy), [@twitter](https://twitter.com/deejayyhu)

## License

This project is licensed under the MIT license.
