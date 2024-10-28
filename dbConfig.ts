import { Property } from "src/entities/property.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export const pgConfig: PostgresConnectionOptions = {
    url: "postgresql://NestJsDB_owner:oUhaASnu8k6y@ep-red-math-a5e23ne4.us-east-2.aws.neon.tech/NestJsDB?sslmode=require",
    type: 'postgres',
    port: 3306,
    // entities: [Property],  หรือใช้แบบ
    entities: [__dirname + '/**/*.entity{.ts,.js}'],  //เป็นการหาทุกไฟล์ที่เป็น .entity
    synchronize: true
}
