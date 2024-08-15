import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardEntity1710000719634 implements MigrationInterface {
    name = 'AddCardEntity1710000719634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "number" character varying(24) NOT NULL DEFAULT '', "cvv" character varying(3) NOT NULL DEFAULT '', "expire_month" character varying(2) NOT NULL DEFAULT '', "expire_year" character varying(2) NOT NULL DEFAULT '', "user_id" uuid, CONSTRAINT "REL_00ec72ad98922117bad8a86f98" UNIQUE ("user_id"), CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "card" ADD CONSTRAINT "FK_00ec72ad98922117bad8a86f980" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "card" DROP CONSTRAINT "FK_00ec72ad98922117bad8a86f980"`);
        await queryRunner.query(`DROP TABLE "card"`);
    }

}
