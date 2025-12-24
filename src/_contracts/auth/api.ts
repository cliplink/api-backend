import { BodyLogin, Login } from './index';

export interface Api {
  login(data: BodyLogin): Promise<Login>;
}
