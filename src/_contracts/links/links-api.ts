import { ApiBase } from '../api-base';

import { CreateLink, Link } from './index';

export abstract class LinksApi implements ApiBase {
  public readonly baseUrl = '/links';

  public abstract createLink(data: CreateLink): Promise<Link>;
}
