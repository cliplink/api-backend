import { ApiBase } from '../api-base';

import { CreateUser, User } from './index';

export abstract class UsersApi implements ApiBase {
  public readonly baseUrl = '/users';

  protected abstract createUser(data: CreateUser): Promise<User>;
}
