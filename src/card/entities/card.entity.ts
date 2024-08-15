import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { UpsertCardRequestDto } from '../dtos/request/upsert-card.request.dto';
import { UpsertCardResponseDto } from '../dtos/response/upsert-card.response.dto';

@Entity({name: 'card'})
export class Card extends BaseEntity {
    @Column({name: 'number', type: 'varchar', length: 24, default: ''})
    public number: string

    @Column({name: 'cvv', type: 'varchar', length: 3, default: ''})
    public cvv: string;

    @Column({name: 'expire_month', type: 'varchar', length: 2, default: ''})
    public expireMonth: string;

    @Column({name: 'expire_year', type: 'varchar', length: 2, default: ''})
    public expireYear;

    @OneToOne(() => User, (user) => user.card)
    @JoinColumn({name: 'user_id'})
    public user: User;

    public static toDto(card: Card): UpsertCardResponseDto {
        return {
            number: card.number,
            cvv: card.cvv,
            expireMonth: card.expireMonth,
            expireYear: card.expireYear,
        }
    }

    public static fromUpdateDto(cardDto: UpsertCardRequestDto): Card {
        const card = new Card();

        card.number = cardDto.number;
        card.cvv = cardDto.cvv;
        card.expireMonth = cardDto.expireMonth;
        card.expireYear = cardDto.expireYear;

        return card;
    }
}
