import { SelectQueryBuilder } from "typeorm";

//อินเทอร์เฟซ (Interfaces)เป็นตัวกำหนดรูปแบบข้อมูลสำหรับการใช้งาน pagination
export interface IPaginationOptions {
  page: number; //หน้าปัจจุบัน
  limit: number; //จำนวนข้อมูลต่อหน้า
  search?: string; //คำค้นหาสำหรับฟิลด์ในฐานข้อมูล
  direction?: "ASC" | "DESC"; //การจัดเรียงข้อมูล (ASC หรือ DESC)
  orderBy?: string; //ฟิลด์ที่ใช้สำหรับเรียงลำดับ
}

//ใช้สำหรับเก็บผลลัพธ์หลังจากทำ pagination
export interface IPaginationResult<T> {
  data: T[]; //ข้อมูลที่ถูกดึงมา
  total: number; //จำนวนข้อมูลทั้งหมด
}

//สำหรับกำหนดเงื่อนไขเพิ่มเติมใน query
export interface IFieldOfOptional {
  field: string; //ชื่อฟิลด์ที่ใช้ในเงื่อนไข
  value: string | number | boolean | number[];  //ค่าของเงื่อนไข
  isArray?: boolean; //ระบุว่าค่านี้เป็น array หรือไม่
}

//เป็น array ของเงื่อนไขเพิ่มเติม
export interface IOptionalConditionArray {
  condition?: IFieldOfOptional[];
}

/**
 * ฟังก์ชั่นสำหรับสร้าง query ใช้แทน "queryBuilderOrder" และ "queryBuilderSearch"
 * @param queryBuilder
 * @param entityAlias
 * @param searchFieldArray
 * @param paginationOption
 * @param optionalCondition
 * @returns
 */
export async function queryBuilderCondition<T>(
  queryBuilder: SelectQueryBuilder<T>, //queryBuilder: ตัวสร้างคำสั่ง SQL ของ TypeORM สำหรับ entity ที่กำลังใช้งาน
  entityAlias: string, //entityAlias: ชื่อ alias ของ entity ที่ใช้ในคำสั่ง SQL เช่น "user"
  searchFieldArray: string[], //searchFieldArray: รายชื่อฟิลด์ที่อนุญาตให้ค้นหา เช่น ['name', 'email']
  paginationOption: IPaginationOptions, //paginationOption: ออปชันสำหรับการค้นหา เช่น search, orderBy, และ direction
  optionalCondition?: IOptionalConditionArray, //optionalCondition: เงื่อนไขเพิ่มเติมสำหรับกรองข้อมูล เช่น เงื่อนไขจากฟิลด์หรือค่าที่ส่งเข้ามา
): Promise<SelectQueryBuilder<T>> {
  if (paginationOption.search && searchFieldArray) {
    let conditions = ``;
    searchFieldArray.map((field: string, index: number) => {
      if (field.includes(".")) {
        // ถ้าฟิลด์มี . (เช่น relation.field) จะใช้ชื่อฟิลด์ตามที่กำหนด
        conditions += `${field} LIKE :search`;
      } else {
        // ถ้าไม่มี . จะเพิ่ม alias ให้ เช่น user.name
        conditions += `${entityAlias}.${field} LIKE :search `;
      }

      if (index < searchFieldArray.length - 1) {
        conditions += ` OR `; //เชื่อมแต่ละเงื่อนไขด้วย OR
      }
    });

    //เพิ่มเงื่อนไขใน queryBuilder ด้วย .where() และใช้ binding parameter :search เพื่อป้องกัน SQL Injection
    queryBuilder.where(`(${conditions})`, {
      search: `%${paginationOption.search}%`,
      //ระบบจะนำค่าจาก { search: ... } มาแทนที่ :search ใน SQL
    });
    //##ตัวอย่างผลลัพธ์ SQL: ถ้า searchFieldArray = ['name', 'email'] และ paginationOption.search = 'john'
    //WHERE (user.name LIKE '%john%' OR user.email LIKE '%john%')
  }

  // optional query
  //ส่วนนี้มีหน้าที่เพิ่ม เงื่อนไขเพิ่มเติม (optionalCondition) เข้าไปใน queryBuilder 
  //โดยอ้างอิงจากค่าที่ส่งเข้ามาในรูปแบบ IOptionalConditionArray
  if (optionalCondition?.condition && searchFieldArray.length > 0) {
    optionalCondition.condition.map((data) => {
      if (!data.isArray) {
        //หาก isArray เป็น false (แสดงว่าเงื่อนไขนี้เป็นการเปรียบเทียบค่าเดียว เช่น เท่ากับ =) จะทำการสร้างเงื่อนไข andWhere แบบ = ต่อไป
        if (data.field.includes(".")) {
            //หาก field มีจุด (.) แสดงว่ามีการอ้างอิงถึง ฟิลด์ในความสัมพันธ์ (relation) เช่น user.profile.name 
            //หรือ order.product.name  ตัวอย่างเช่น user.profile.name = 'John'
          queryBuilder.andWhere(`${data.field} = ${data.value}`);
        } else {
            //หาก field ไม่มีจุด (.) แสดงว่าฟิลด์นั้นอยู่ในตารางหลัก (entityAlias) เช่น users.name = 'John' หรือ users.age = 25
          queryBuilder.andWhere(`${entityAlias}.${data.field} = ${data.value}`);
        }
      } else {
        if (Array.isArray(data.value) && data.value.length > 0) {
            //หาก isArray เป็น true (แสดงว่า value เป็น array หรือหลายค่า), เงื่อนไขจะใช้ IN เพื่อค้นหาหลายค่าในฟิลด์นั้น 
            //เช่น field IN ('value1', 'value2', 'value3')
          queryBuilder.andWhere(`${data.field} IN (:...value)`, {
            value: data.value,
          });
          //ตัวอย่างการใช้งาน:
            //ค้นหา user ที่มี age = 25 และ status อยู่ในรายการ ['active', 'inactive']
        }
      }
    });
  }

  // order query
  if (paginationOption.orderBy && paginationOption.direction) {
    //paginationOption.orderBy: เป็นฟิลด์ที่เราต้องการให้ข้อมูลเรียงตาม (เช่น name, age, created_at ฯลฯ)
    //paginationOption.direction: ทิศทางที่ใช้ในการเรียงข้อมูล (ASC หรือ DESC)
    queryBuilder.orderBy(
      `${entityAlias}.${paginationOption.orderBy}`,
      //${entityAlias}.${paginationOption.orderBy}: เป็นการระบุฟิลด์ที่ต้องการจะใช้ในการจัดเรียง (เช่น users.name)
      paginationOption.direction,
    );
  }

  return queryBuilder;
}

/**
 * ฟังก์ชั่นสำหรับการเรียกใช้ข้อมูลในรูปแบบ pagination
 * @param queryBuilder
 * @param options
 * @returns
 */
export async function queryBuilderPaginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<IPaginationResult<T>> {
  const [data, total] = await queryBuilder
    .skip(options.page * options.limit)
    .take(options.limit)
    .getManyAndCount();

  return { data, total };
}

/**
 * ฟังก์ชั่นสำหรับการเรียกใช้ข้อมูลในรูปแบบ pagination ที่เป็น raw data
 * @param queryBuilder
 * @param options
 * @returns
 */
export async function queryBuilderPaginateRawData<T>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions,
): Promise<any> {
  const builder = queryBuilder
    .skip(options.page * options.limit) //หาก page = 2 และ limit = 10 จะข้าม 20 แถวแรก ( 2 * 10 = 20 )
    .take(options.limit); // ถ้า limit = 10 จะดึงข้อมูลมาเพียง 10 แถวต่อครั้ง

  const data = await builder.getRawMany();
  //ใช้ getRawMany() เพื่อดึงข้อมูลทั้งหมดที่ตรงตามเงื่อนไขของ queryBuilder โดยจะได้ข้อมูลในรูปแบบ "raw data"
  const total = await builder.getCount();
  //getCount() ใช้ในการนับจำนวนข้อมูลทั้งหมดในฐานข้อมูลที่ตรงกับคำสั่ง SQL ที่สร้างจาก queryBuilder (ไม่จำกัดจำนวนหน้า) และจะคืนค่าจำนวนแถวทั้งหมดที่มีในตาราง

  return { data, total };
}
