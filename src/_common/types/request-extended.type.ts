import { Request } from 'express';

import { UserRequest } from './user-request.type';

export interface RequestExtended extends Request {
  user?: UserRequest;
}
