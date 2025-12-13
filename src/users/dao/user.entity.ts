import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LinkEntity } from '../../links/dao/link.entity';

@Entity('users')
@Index('IDX_USERS_EMAIL', ['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true, nullable: false })
  public email: string;

  @Column({ nullable: false, name: 'password_hash' })
  public passwordHash: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(() => LinkEntity, (link) => link.user, { eager: false })
  links?: LinkEntity[];
}
