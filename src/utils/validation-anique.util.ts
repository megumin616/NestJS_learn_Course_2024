import { Repository } from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

export interface IFieldOfCondition {
  field: string; // ชื่อฟิลด์ในฐานข้อมูลที่ต้องการตรวจสอบ
  value: string; // ค่าที่ต้องการตรวจสอบ (value ของฟิลด์นั้น)
  withDeleted: boolean; // ใช้ระบุว่าจะตรวจสอบรวมข้อมูลที่ถูกลบหรือไม่ (soft delete)
  response?: string; // (ไม่จำเป็น) กำหนดข้อความตอบกลับในกรณีค่าซ้ำ (ชื่อฟิลด์ที่แสดงใน error)
  company?: {
    // (ไม่จำเป็น) ใช้ในกรณีที่ฟิลด์เกี่ยวข้องกับบริษัท
    field: string; // ชื่อฟิลด์บริษัท (เช่น company_id)
    value: number; // ค่าของบริษัท (เช่น 1 หรือ 2)
  };
}

//## ตัวอย่าง
// const condition: IFieldOfCondition = {
//     field: "email",             // ตรวจสอบอีเมล
//     value: "test@example.com",  // ค่าอีเมลที่ต้องการตรวจสอบ
//     withDeleted: false,         // ไม่รวมข้อมูลที่ถูกลบ
//     response: "Email address",  // ใช้ข้อความแสดงว่า Email address ซ้ำ
//     company: {                  // จำกัดขอบเขตการตรวจสอบในบริษัท
//       field: "company_id",      // ใช้ฟิลด์ company_id
//       value: 1                  // บริษัท ID = 1
//     }
//   };

export type TIgnoreCondition = {
  field: string; // ชื่อฟิลด์ที่ใช้ตรวจสอบ (เช่น 'id')
  id: number; // ค่าที่ต้องการข้าม (เช่น id ของข้อมูลปัจจุบัน)
};

export type TDeleteCondition = {
  field: string; // ชื่อฟิลด์ที่ใช้ตรวจสอบ (เช่น 'is_deleted')
  isDeleteValue: any; // ค่าที่บ่งบอกว่าข้อมูลถูกลบ (เช่น true หรือ 1)
};

export interface IFieldConditionArray {
  conditions: IFieldOfCondition[];
  ignore?: TIgnoreCondition;
  deleteCondition?: TDeleteCondition;
}

/**
 * ฟังก์ชั่นสำหรับใช้งานการตรวจสอบ unique field ที่มีความสามารถ throw error ได้ทันทีเมื่อพบค่าการซ้ำกันของข้อมูล
 * @param repository  repository target
 * @param fieldConditionArray  field และ value ที่ต้องการตรวจสอบค่า (กรณีฟิลด์ soft delete ไม่ใช่ deleted_at ให้ระบุมาใน deleteCondition)
 */
export async function validationUnique<T>(
  repository: Repository<T>,
  fieldConditionArray: IFieldConditionArray,
): Promise<void> {
  //ฟังก์ชันนี้ต้องการทราบชื่อของตารางที่เกี่ยวข้องเพื่อสร้าง SQL Query ได้ถูกต้อง เช่น หาก repository เป็นของตาราง users ค่านี้จะเก็บว่า users
  let tableName = repository.metadata.tableName; //ใช้ TypeORM เพื่อดึงชื่อของตารางในฐานข้อมูลที่สัมพันธ์กับ repository ที่เรากำลังใช้

  //ignore ใช้สำหรับระบุแถว (row) ที่ต้องการข้ามในการตรวจสอบความซ้ำ 
  //เช่น: หากเรากำลังอัปเดตข้อมูลบางรายการ เราอาจข้ามการตรวจสอบค่าที่ตรงกับ ID ของแถวนั้นเอง
  let ignore = fieldConditionArray?.ignore;

  //ถ้ามี deleteCondition จะเพิ่มเงื่อนไขเข้าไปใน Query เพื่อกรองข้อมูลที่ยังไม่ได้ลบ
  let deleteCondition = fieldConditionArray?.deleteCondition;

  let queryString = `SELECT `;
  fieldConditionArray.conditions.map((data, index) => {
    queryString += `(SELECT COUNT(${data.field}) FROM ${tableName} WHERE ${data.field} = "${data.value}" `;
            /*
            ตัวอย่าง SQL Query
        สมมติว่า tableName = "users" และ fieldConditionArray.conditions มีฟิลด์ดังนี้:
        conditions: [
        { field: "email", value: "test@example.com", withDeleted: false },
        { field: "username", value: "user123", withDeleted: true }
        ]
        
        SQL Query ที่กำลังสร้างจะมีลักษณะดังนี้:
        SELECT 
        (SELECT COUNT(email) FROM users WHERE email = "test@example.com"), 
        (SELECT COUNT(username) FROM users WHERE username = "user123")

        ใช้ COUNT เพื่อเช็กจำนวนแถวที่มีค่าเท่ากับเงื่อนไขที่กำหนด,
        ฟิลด์แต่ละตัวจะถูกตรวจสอบใน Query เดียวแต่แยกกันในแต่ละ subquery,
            #อธิบายง่ายๆ "ตรวจสอบว่ามี email ในตาราง users ที่มีค่าเป็น test@example.com อยู่กี่แถว"
            */

    // if company value
    if (data?.company)
      queryString += `AND ${data.company.field} = "${data.company.value}" `;
    /*
        #ตัวอย่างโค้ด
         const data = {
            field: "email",
            value: "john@example.com",
            withDeleted: false,
            company: {
                field: "company_id",
                value: 1
            }
        };
        # SQL ที่ได้:
        SELECT COUNT(email) 
        FROM users 
        WHERE email = "john@example.com" 
        AND company_id = "1"

        (queryString += คือทั้งหมดที่อยู่หน้า AND .......)
    */

    // if ignore value
    if (ignore) queryString += `AND ${ignore.field} != ${ignore.id} `;
    /*
        ## ยกเว้นข้อมูลบางรายการ จากการตรวจสอบความซ้ำซ้อนในฐานข้อมูล
        #ตัวอย่าง 
            SELECT COUNT(email)
            FROM users
            WHERE email = "john@example.com" 
            AND id != 1

        AND id != 1: เพิ่มเงื่อนไขว่าอย่านับข้อมูลที่ ID เท่ากับ 1
        ผลลัพธ์: ระบบจะตรวจสอบเฉพาะแถวที่ไม่ใช่ ID = 1
    */

    // if delete field is not "deleted_at"
    if (!data.withDeleted) {
      if (deleteCondition) {
        queryString += `AND ${deleteCondition.field} != ${deleteCondition.isDeleteValue}`;
        //deleteCondition.field: ระบุชื่อฟิลด์ที่ใช้บอกสถานะการลบ (เช่น is_deleted)
        //deleteCondition.isDeleteValue: ระบุค่าที่บ่งบอกว่าข้อมูลถูกลบแล้ว (เช่น 1)
        //คำสั่งนี้จะเพิ่มเงื่อนไขใน Query ให้ตรวจสอบเฉพาะข้อมูลที่ไม่ได้ถูกลบ
      } else {
        queryString += `AND deleted_at IS NULL `;
        //เพิ่มเงื่อนไขว่า deleted_at ต้องเป็น NULL หมายถึงข้อมูลยังไม่ถูกลบ
        //หมายความว่าจะตรวจสอบทุกข้อมูล รวมถึงถูกลบไปแล้วก็ตาม
      }
    }

    queryString += `) AS ${data.field}`;
    if (index < fieldConditionArray.conditions.length - 1) {
      queryString += ', ';
    }
  });
// เรียกใช้ queryString เพื่อดึงข้อมูลจากฐานข้อมูล
const [resultQuery] = await repository.query(queryString);

// สร้างอาร์เรย์สำหรับเก็บฟิลด์ที่ตรวจพบข้อมูลซ้ำ
const dataResult = [];

// วนลูปตรวจสอบแต่ละฟิลด์ใน fieldConditionArray
fieldConditionArray.conditions.map((item) => {
  // ตรวจสอบว่ามีข้อมูลซ้ำในฟิลด์หรือไม่ (resultQuery[item.field] > 0)
  if (Number(resultQuery[item.field]) > 0) {
    // เก็บฟิลด์ที่ซ้ำพร้อมข้อความแจ้งเตือนใน dataResult
    dataResult.push({
      fieldName: item.response || item.field, // ชื่อฟิลด์ (หรือ response ถ้ามี)
      message: `"${item.value}" has already exists.`, // ข้อความแจ้งเตือน
    });
  }
});

// หากพบข้อมูลซ้ำ ขว้างข้อผิดพลาดพร้อมข้อมูลรายละเอียด
if (dataResult.length > 0) {
  throw new UnprocessableEntityException(dataResult);
}

}
