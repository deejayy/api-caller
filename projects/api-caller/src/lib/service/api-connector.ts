import { Observable } from 'rxjs';
import { ApiInterface } from '../model/api-call-item.model';

export class ApiConnector {
  public tokenData$: Observable<string>;
  public defaultApiUrl: string;
  public errorHandler: (payload: ApiInterface) => void;
}
