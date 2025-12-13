import { Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

export abstract class AbstractPartitionManagerService implements OnModuleInit {
  protected abstract logger: Logger;
  protected abstract tableName: string;
  protected abstract dataSource: DataSource;
  protected abstract monthsToKeep: number;
  protected abstract archiveSchemaName: string;
  protected abstract moveTableToArchiveSchema: boolean;
  protected abstract dropOldTable: boolean;

  abstract onModuleInit(): void;

  async createPartitions(monthsAhead = 3): Promise<void> {
    this.logger.log('Checking and creating future partitions...');

    const now = new Date();

    for (let i = 0; i <= monthsAhead; i++) {
      const targetDate = new Date(now);
      targetDate.setMonth(targetDate.getMonth() + i);

      await this.createPartitionIfNotExists(targetDate);
    }

    this.logger.log('Partition check completed');
  }

  private async createPartitionIfNotExists(date: Date): Promise<void> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const partitionName = `${this.tableName}_p${year}_${month}`;

    const exists = await this.checkPartitionExists(partitionName);

    if (exists) {
      this.logger.debug(`Partition ${partitionName} already exists`);
      return;
    }

    const startDate = new Date(year, date.getMonth(), 1);
    const endDate = new Date(year, date.getMonth() + 1, 1);

    const rangeStart = startDate.toISOString().split('T')[0];
    const rangeEnd = endDate.toISOString().split('T')[0];

    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF links
          FOR VALUES FROM ('${rangeStart}') TO ('${rangeEnd}');
      `);

      this.logger.log(`Created partition: ${partitionName} for range ${rangeStart}, ${rangeEnd}`);
    } catch (error) {
      this.logger.error(
        `Failed to create partition ${partitionName} for range ${rangeStart}, ${rangeEnd}:`,
        error,
      );
      throw error;
    }
  }

  private async checkPartitionExists(partitionName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        SELECT EXISTS (SELECT
                       FROM pg_tables
                       WHERE schemaname = 'public'
                         AND tablename = $1);
      `,
      [partitionName],
    );

    return result[0]?.exists || false;
  }

  async archiveOldPartitions(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - this.monthsToKeep);

    const year = cutoffDate.getFullYear();
    const month = String(cutoffDate.getMonth() + 1).padStart(2, '0');

    this.logger.log(`Dropping ${this.tableName} table partitions older than ${year}-${month}`);

    const partitions = await this.dataSource.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename LIKE '${this.tableName}_p%}_%'
        AND tablename ~ '^links_[0-9]{4}_[0-9]{2}$'
      ORDER BY tablename;
    `);

    for (const partition of partitions) {
      const tableName = partition.tablename;

      const regex = new RegExp(`^${this.tableName}_p(\\d{4})_(\\d{2})$`);
      const match = tableName.match(regex);
      if (!match) continue;

      const partYear = parseInt(match[1], 10);
      const partMonth = parseInt(match[2], 10);
      const partDate = new Date(partYear, partMonth - 1, 1);

      if (partDate < cutoffDate) {
        this.logger.log(`Dropping old partition: ${tableName}`);

        await this.archivePartition(tableName);

        if (this.dropOldTable) {
          await this.dataSource.query(`DROP TABLE ${tableName};`);
        }
      }
    }
  }

  private async archivePartition(partitionName: string): Promise<void> {
    await this.dataSource.query(`
      ALTER TABLE links DETACH PARTITION ${partitionName};
    `);

    if (this.moveTableToArchiveSchema) {
      if (this.archiveSchemaName.length === 0) {
        this.logger.warn(
          `Archive schema name is not set. Skipping partition ${partitionName} moving.`,
        );

        return;
      }

      await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${this.archiveSchemaName};`);

      await this.dataSource.query(`
        ALTER TABLE ${partitionName} SET SCHEMA archive;
      `);
    }
  }
}
