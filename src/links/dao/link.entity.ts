import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../users/dao/user.entity';

@Entity('links')
@Index('IDX_LINKS_USER_ID', ['userId'])
@Index('IDX_LINKS_SHORT_ID', ['shortId'], { unique: true })
@Index('IDX_LINKS_EXPIRES_AT', ['expiresAt'])
export class LinkEntity {
  // Use string here to avoid precision loss when values exceed the 2^53 limit
  @PrimaryGeneratedColumn({ type: 'bigint' })
  public id: string;

  @Column({ type: 'varchar', name: 'short_id', unique: true })
  public shortId: string;

  @Column({ type: 'varchar', name: 'target', nullable: false })
  public target: string;

  @Column({ type: 'varchar', nullable: true, name: 'user_id' })
  public userId: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  public expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', default: 'now()', name: 'created_at' })
  public createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  public deletedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.links, { eager: false })
  @JoinColumn({ name: 'user_id' })
  public user?: UserEntity | null;
}
