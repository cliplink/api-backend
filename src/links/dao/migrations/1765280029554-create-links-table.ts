import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLinksTable1765280029554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE links
      (
        id         BIGSERIAL,
        short_id   VARCHAR     NOT NULL,
        target     VARCHAR     NOT NULL,
        user_id    VARCHAR,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        CONSTRAINT PK_IDX PRIMARY KEY (id, created_at)
      ) PARTITION BY RANGE (created_at);
    `);

    const now = new Date();

    const pad = (n) => String(n).padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);

    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayCurrentMonthStr = `${firstDayCurrentMonth.getFullYear()}-${pad(firstDayCurrentMonth.getMonth() + 1)}-01`;

    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const firstDayNextMonthStr = `${firstDayNextMonth.getFullYear()}-${pad(firstDayNextMonth.getMonth() + 1)}-01`;

    await queryRunner.query(`
      CREATE TABLE links_p${year}_${month} PARTITION OF links
        FOR VALUES FROM ('${firstDayCurrentMonthStr}') TO ('${firstDayNextMonthStr}');
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_LINKS_SHORT_ID ON links (short_id, created_at);`,
    );
    await queryRunner.query(`CREATE INDEX IDX_LINKS_USER_ID ON links (user_id);`);
    await queryRunner.query(`CREATE INDEX IDX_LINKS_EXPIRES_AT ON links (expires_at);`);
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
