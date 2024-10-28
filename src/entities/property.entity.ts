import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyFeature } from './propertyFeature.entity';
import { User } from './user.entity';
import { PropertyType } from './propertyType.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { scale: 2, default: 0 }) //ระวังเรื่องการกำหมดข้อมูล type ที่ไม่ตรงกับการ faker ข้อมูล ก็จะเกิน error ได้
  price: number;
  

  @OneToOne(
    () => PropertyFeature, // กำหนดว่า Property มีความสัมพันธ์แบบหนึ่งต่อหนึ่งกับ PropertyFeature
    (propertyFeature) => propertyFeature.property, // บอกให้ TypeORM รู้ว่าฝั่งตรงข้ามคือ property ใน PropertyFeature
    { cascade: true }, // ใช้ cascade: true เพื่อทำให้ Property สามารถสร้างหรืออัปเดต PropertyFeature ได้อัตโนมัติ
    //ถ้าไม่มี cascade เราจะต้องบันทึก PropertyFeature แยกก่อนแล้วค่อยบันทึก Property ซึ่งทำให้โค้ดยาวขึ้น และยุ่งยาก
  )
  //1) ใช้ @OneToOne(() => PropertyFeature) เพื่อบอกว่า Property แต่ละรายการจะมี PropertyFeature หนึ่งรายการที่สัมพันธ์กัน
  //2) ไม่ได้เพิ่ม @JoinColumn() ในฝั่งนี้ เพราะ @JoinColumn() ควรถูกกำหนดใน entity หนึ่งด้านเท่านั้น
  //(ในกรณีนี้เราเลือกด้านของ PropertyFeature)
  propertyFeature: PropertyFeature;

  @ManyToOne(() => User, (user) => user.properties)
  @JoinColumn({name: 'ownerId'})  // ใน {} ใช้ระบุชื่อ column
  //ความสัมพันธ์นี้คือ หลายต่อหนึ่ง (Many-to-One) ซึ่งหมายถึง Property หลายรายการสามารถมี User เดียวกันได้
  user: User;

  @ManyToMany(() => User, (user) => user.likedProperties)
  //ความสัมพันธ์แบบ Many-to-Many กับ User โดยฝั่งนี้จะใช้ likedBy เป็นชื่อของ array ที่เก็บ User ที่กดชอบ Property นี้
  likedBy: User[];
  //การใช้ [] ใน likedBy: User[] บอกว่า ฟิลด์นี้เป็น array ของ User 
  //เนื่องจากความสัมพันธ์แบบ Many-to-Many หมายความว่า หลาย User สามารถชอบหลาย Property ได้

  @ManyToOne(() => PropertyType)
  type: PropertyType;

}
