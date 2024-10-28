import { faker } from '@faker-js/faker';
import { Property } from '../entities/property.entity';
import { PropertyFeature } from '../entities/propertyFeature.entity';
import { PropertyType } from '../entities/propertyType.entity';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class MainSeeder implements Seeder {
  // ฟังก์ชัน run จะถูกเรียกเมื่อเราทำการรัน seeder
  public async run(
    dataSource: DataSource, // ข้อมูล DataSource สำหรับการติดต่อกับฐานข้อมูล
    factoryManager: SeederFactoryManager, //  ตัวแปรนี้คือผู้จัดการที่ช่วยในการสร้างข้อมูลปลอม (Faker data).
    //คล้ายกับการเป็นผู้ช่วยที่คอยเตรียมสิ่งที่เราต้องการสร้างไว้ให้เรา
  ): Promise<any> {
    // รับ repository สำหรับ PropertyType
    // const typeRepository = dataSource.getRepository(PropertyType); **

    // สร้างประเภทของ Property โดยบันทึกประเภท Condo และ Apartment **
    // const propertyTypes = await typeRepository.save([
    //   { value: 'Condo' },
    //   { value: 'Apartment' },
    // ]);

    const propertyTypeFactory = factoryManager.get(PropertyType)
    const propertyType = await propertyTypeFactory.saveMany(10);


    const userFactory = factoryManager.get(User);
    //factoryManager เปรียบเสมือนผู้จัดการโรงงานที่เตรียมการผลิตสินค้าต่างๆ 
    //และ get(User) คือการขอให้ผู้จัดการเตรียม "โรงงาน" ที่ใช้สร้างผู้ใช้ (User) ขึ้นมา.

    const users = await userFactory.saveMany(10);
    //saveMany(10) คือคำสั่งที่บอกให้ userFactory สร้างข้อมูลผู้ใช้จำนวน 10 คนในครั้งเดียว.

    // รับ Factory สำหรับ Property และ PropertyFeature
    const propertyFactory = factoryManager.get(Property);
    const propertyFeatureFactory = factoryManager.get(PropertyFeature);

    // สร้าง Property จำนวน 50 ตัว
    const properties = await Promise.all( //4) Promise.all คือการรอให้บ้านทั้ง 50 หลังเสร็จสิ้นการก่อสร้างก่อนที่จะมีการประเมินค่าหรือการดำเนินการในขั้นตอนถัดไป.
      Array(50) // สร้างอาเรย์ที่มีความยาว 50
        .fill('') // เติมอาเรย์ด้วยค่าเริ่มต้นเป็น '' (string ว่าง)
        //1) Array(50).fill('')เปรียบเสมือนการสร้างแผนผังบ้านที่มี 50 แผนผังที่ยังไม่ได้สร้างจริง.
        .map(async () => {  //2) map(async () => {...}) คือการมอบหมายให้ช่างก่อสร้างแต่ละคนสร้างบ้านตามแผนผังที่กำหนด.
          // สำหรับแต่ละตัวในอาเรย์ เราจะสร้าง Property ใหม่
          const property = await propertyFactory.make({ 
            //3) await propertyFactory.make({...}) คือการใช้วัสดุและข้อมูลที่ถูกต้องในการสร้างบ้านที่เสร็จสมบูรณ์.
            // กำหนด User แบบสุ่มจากอาเรย์ของ User ที่สร้างไว้
            user: faker.helpers.arrayElement(users), //ใช้ faker.helpers.arrayElement(users) เพื่อสุ่มเลือกผู้ใช้จากอาร์เรย์ users ที่เราสร้างไว้ก่อนหน้านี้.
            // กำหนด PropertyType แบบสุ่มจากอาเรย์ของ PropertyType ที่สร้างไว้
            type: faker.helpers.arrayElement(propertyType), //ใช้ faker.helpers.arrayElement(propertyTypes) เพื่อสุ่มเลือกประเภทของ Property จากอาร์เรย์ propertyTypes.
            // สร้าง PropertyFeature ใหม่และบันทึกลงฐานข้อมูล
            propertyFeature: await propertyFeatureFactory.save(),
            //ใช้ await propertyFeatureFactory.save() เพื่อสร้าง PropertyFeature ใหม่และบันทึกมันลงในฐานข้อมูล.
          });
          return property; // คืนค่ากลับเป็น Property ที่สร้างขึ้น
        }),
    );

    // รับ repository สำหรับ Property
    const propertyRepository = dataSource.getRepository(Property);
    //เป็นการเตรียมการสำหรับการเข้าถึงข้อมูลของ Property ในฐานข้อมูล ซึ่งช่วยให้เราสามารถทำงานกับข้อมูล Property ได้

    // บันทึก Property ที่สร้างไว้ทั้งหมดลงในฐานข้อมูล
    await propertyRepository.save(properties);
  }
}
