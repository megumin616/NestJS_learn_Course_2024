import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Property } from "./property.entity";
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    avatarUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: null })
    password: string;

    @OneToMany(() => Property, (property) => property.user)
    //ความสัมพันธ์นี้คือ หนึ่งต่อหลาย (One-to-Many) ซึ่งหมายถึง User หนึ่งคนสามารถมี Property หลายรายการ
    properties: Property[];

    @ManyToMany(() => Property, (property) => property.likedBy)
    //ความสัมพันธ์แบบ Many-to-Many ซึ่งหมายความว่า User หลายคนสามารถชอบ Property เดียวกันได้ 
    @JoinTable({name: 'user_liked_properties'}) //@JoinTable: ใช้สร้างตารางกลาง (junction table) เพื่อเก็บข้อมูลของความสัมพันธ์นี้
    //ในความสัมพันธ์แบบ Many-to-Many จำเป็นต้องมีตารางกลางหรือ junction table เพื่อเก็บข้อมูลว่าผู้ใช้คนใดกดชอบอสังหาริมทรัพย์ใด

    //name: 'user_liked_properties': ระบุให้ชื่อของตารางกลางเป็น user_liked_properties ซึ่งจะเก็บข้อมูลความสัมพันธ์ระหว่าง User และ Property
    likedProperties: Property[];


    // ## การ hash password แบบที่ 1 โดยมีการ hash ใน entity เลย
    //ก่อนจะเพิ่มข้อมูลให้ hash password ไปก่อน ตรงส่วนนี้สามารถใช้ใน service ได้
    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10)
    }
}