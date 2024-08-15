import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';

@Entity({ name: 'facebook_auth' })
export class FacebookAuthEntity extends BaseEntity{
    @Column({name: 'social_id', type: 'varchar', length: '250'})
    public socialId: string;
}
