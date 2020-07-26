import { Observable } from 'rxjs';

export class ApiConnector {
  public tokenData$: Observable<string>;
  public defaultApiUrl: string;
  public errorHandler: Function;
}
