import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import type { ObjectLiteral, Repository } from 'typeorm';

export function getRepository<T extends ObjectLiteral>(
  moduleFixture: TestingModule,
  entityClass: EntityClassOrSchema,
): Repository<T> {
  return moduleFixture.get(getRepositoryToken(entityClass));
}
