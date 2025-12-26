import { ApiBase } from '../api-base';

import { BodyLogin, Login } from './index';

export abstract class Api implements ApiBase {
  public readonly baseUrl = '/auth';

  public abstract login(data: BodyLogin): Promise<Login>;
}
