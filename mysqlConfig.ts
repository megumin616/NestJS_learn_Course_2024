import { Testing } from "src/testing/entities/testing.entity";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";


export const mysqlConfig: MysqlConnectionOptions = {
    type: 'mysql',
    host: 'localhost', // หรือ IP ของ MySQL Server
    port: 3306, // Port ของ MySQL
    username: 'root', // ชื่อผู้ใช้ของ MySQL
    password: '', // รหัสผ่านของ MySQL
    database: 'nestjs_crud02', // ชื่อฐานข้อมูลที่ต้องการเชื่อมต่อ
    entities: [Testing], 
    synchronize: true, // ปรับปรุง schema อัตโนมัติ
}