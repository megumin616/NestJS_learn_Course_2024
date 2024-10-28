import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Testing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    value: string;
}
