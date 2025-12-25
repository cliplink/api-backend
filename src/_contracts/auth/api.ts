import { BodyLogin, Login } from './index';

export abstract class Api {
  protected readonly baseUrl = '/auth';

  public abstract login(data: BodyLogin): Promise<Login>;
}
