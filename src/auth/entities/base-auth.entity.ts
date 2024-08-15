import { BaseEntity } from '../../core/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { LocalAuthEntity } from './local-auth.entity';
import { FacebookAuthEntity } from './facebook-auth.entity';
import { GoogleAuthEntity } from './google-auth.entity';
import { AuthProvider } from '../enums/auth-provider.enum';

@Entity({name: 'auth'})
export class BaseAuthEntity extends BaseEntity {
    @Column({name: 'email', type: 'varchar', length: 250, unique: true})
    public email: string;

    @Column({name: 'refresh_token', type: 'varchar', nullable: true})
    public refreshToken: string;

    @Column({name: 'reset_password_token', type: 'varchar', nullable: true})
    public resetPasswordToken: string;

    @Column({name: 'is_according_term_use', type: 'boolean', default: true})
    public isAccordingTermUse: boolean;

    @Column({
        name: 'provider',
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    public provider: AuthProvider;

    @OneToOne(() => LocalAuthEntity, {cascade: true})
    @JoinColumn()
    public localAuth: LocalAuthEntity;

    @OneToOne(() => FacebookAuthEntity, {cascade: true})
    @JoinColumn()
    public facebookAuth: FacebookAuthEntity;

    @OneToOne(() => GoogleAuthEntity, {cascade: true})
    @JoinColumn()
    public googleAuth: GoogleAuthEntity;
}
