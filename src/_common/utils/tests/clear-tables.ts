import type { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

export async function clearTables(moduleFixture: TestingModule): Promise<void> {
  const dataSource = moduleFixture.get(DataSource);
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
}
