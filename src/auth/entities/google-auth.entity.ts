import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';

@Entity({ name: 'google_auth' })
export class GoogleAuthEntity extends BaseEntity {
    @Column({name: 'social_id', type: 'varchar', length: '250'})
    public socialId: string;
}
