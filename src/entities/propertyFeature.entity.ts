import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Property } from "./property.entity";

@Entity()
export class PropertyFeature {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bedrooms: number;

    @Column()
    parkingSpots: number;

    @Column()
    area: number;

    @Column()
    hasBalcony: boolean;

    @Column()
    hasGardenYeard: boolean;

    @Column()
    hasSwimmingPool: boolean;

    @OneToOne(() => Property, (property) => property.propertyFeature)
    @JoinColumn()
    //@JoinColumn() ระบุว่า PropertyFeature เป็นฝ่ายที่เก็บคีย์เชื่อมโยง (foreign key) กับ Property 
    //ทำให้ TypeORM รู้ว่าจะใช้ตารางของ PropertyFeature ในการเก็บข้อมูลการเชื่อมโยงนี้
    property: Property;
}