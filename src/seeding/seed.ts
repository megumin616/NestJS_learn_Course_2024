import { pgConfig } from '../../dbConfig';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { PropertyFactory } from './property.factory';
import { UserFactory } from './user.factory';
import { PropertyFeatureFactory } from './propertyFeature.factory';
import { MainSeeder } from './main.seeder';
import { PropertyTypeFactory } from './propertyType.factory';

//1) ตั้งค่าตัวแปร options
const options: DataSourceOptions & SeederOptions = {
  ...pgConfig, //นำค่าการตั้งค่า PostgreSQL ที่เก็บอยู่ในตัวแปร pgConfig มาผนวกเข้าใน options
  factories: [PropertyFactory, UserFactory, PropertyFeatureFactory, PropertyTypeFactory], //กำหนด Factory ที่จะใช้ในการสร้างข้อมูลตัวอย่าง
  seeds: [MainSeeder], //กำหนด Seeder ที่จะใช้ในการสร้างข้อมูล โดยในที่นี้ใช้ MainSeeder ซึ่งจะมีการสร้างข้อมูลตามที่ได้ระบุใน class MainSeeder
};
//ประมาณว่า options เปรียบเสมือนการทำรายการสั่งอาหารที่ระบุว่าเราต้องการอะไรบ้าง (เช่น อาหารไหน, เครื่องดื่มอะไร)

//2) สร้าง DataSource
const datasource = new DataSource(options); //จุดประสงค์: สร้างการเชื่อมต่อกับฐานข้อมูล
//นึกภาพว่าเรากำลังเชื่อมต่อกับร้านอาหารด้วยหมายเลขโทรศัพท์ (ข้อมูลที่เราตั้งค่าใน options)

//3) เริ่มต้น DataSource
datasource.initialize().then(async () => {
  //datasource.initialize(): เรียกใช้ method เพื่อทำการเชื่อมต่อกับฐานข้อมูลจริง ซึ่งจะคืนค่าเป็น Promise
  //เหมือนกับการโทรไปที่ร้านอาหารและรอให้พนักงานรับสาย

  await datasource.synchronize(true);  // ล้างข้อมูลเก่าก่อน
  //datasource.synchronize(true); ซิงโครไนซ์ฐานข้อมูลเพื่อให้ตรงกับโครงสร้างข้อมูลที่เราตั้งไว้
  //คล้ายกับการบอกพนักงานว่า "ขอให้ล้างโต๊ะและเตรียมอาหารตามเมนูใหม่ทั้งหมด"

  await runSeeders(datasource);  // เรียกใช้ Seeder เพื่อสร้างข้อมูลในฐานข้อมูล
  // เหมือนกับการสั่งอาหารตามที่เราต้องการในเมนู (เช่น สั่งพิซซ่าและน้ำอัดลม)

  process.exit(); //ปิดการทำงานของโปรแกรมหลังจากที่สร้างข้อมูลเสร็จสิ้น
});
