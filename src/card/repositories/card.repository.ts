import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { BaseRepository } from '../../core/repositories/base.repository';
import { Card } from '../entities/card.entity';
import { User } from 'src/user/entities/user.entity';

@CustomRepository(Card)
export class CardRepository extends BaseRepository<Card> {

    public async generateCard(userId: string): Promise<void> {
        const card: Card = {
            number: '',
            cvv: '',
            expireMonth: '',
            expireYear: '',
            user: { id: userId } as User,
        } as Card;

        await this.save(card);
    }

    public async findByUserId(userId: string): Promise<Card> {
        return this.findOne({
            where: {
                user: { id: userId }
            },
        });
    }

    public async softDeleteByUserId(userId: string): Promise<void> {
        await this.createQueryBuilder('card')
            .innerJoin('card.user', 'user')
            .softDelete()
            .where('user.id = :userId', {userId})
            .execute();
    }
}