import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';

@Entity({ name: 'local_auth' })
export class LocalAuthEntity extends BaseEntity {
    @Column({ name: 'password', type: 'varchar', length: 250, nullable: true })
    public password: string;
}
