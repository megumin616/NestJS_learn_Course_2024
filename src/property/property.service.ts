import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Repository } from 'typeorm';
import { Property } from 'src/entities/property.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { error } from 'console';
import { PropertyFeature } from 'src/entities/propertyFeature.entity';
import { PaginationPropertyDto } from './dto/paginatin-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PropertyFeature)
    private propertyFeatureRepository: Repository<PropertyFeature>,
  ) {}

  async findOne(id: number) {
    const property = await this.propertyRepository.findOneBy({ id });
    return property;
  }

  async findAll(paginationPropertyDto: PaginationPropertyDto) {
    return await this.propertyRepository.find({
      skip: paginationPropertyDto.skip,
      take: paginationPropertyDto.limit,
    });
  }

  async create(createPropertyDto: CreatePropertyDto) {
    return await this.propertyRepository.save(createPropertyDto);
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    //แบบที่ 1
    // const propertyId = await this.propertyRepository.findOneBy({ id });
    // Object.assign(propertyId, updatePropertyDto);
    // return await this.propertyRepository.save(propertyId);

    //แบบที่ 2
    return await this.propertyRepository.update({ id }, updatePropertyDto);
  }

  async delete(id: number) {
    return await this.propertyRepository.delete({ id });
  }

  //lile Property test many to many
  async likeProperty(userId: number, propertyId: number): Promise<User> {
    // ดึงข้อมูลผู้ใช้จาก userRepository โดยใช้ userId ที่ได้รับมา และทำการโหลดข้อมูล relations ที่เกี่ยวข้อง (likedProperties)
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['likedProperties'], // โหลดความสัมพันธ์ likedProperties ของผู้ใช้เพื่อจะได้เช็คและอัปเดตข้อมูลได้
      //ถ้าไม่ใช้ relations: // ผลลัพธ์: { id: 1, name: 'Alice', likedProperties: undefined }

      //ถ้าใช้ relations:
      // ผลลัพธ์:
      // {
      //   id: 1,
      //   name: 'Alice',
      //   likedProperties: [
      //     { id: 101, name: 'Condo A', price: 500000 },
      //     { id: 102, name: 'House B', price: 1000000 }
      //   ]
      // }
    });

    // ดึงข้อมูลอสังหาริมทรัพย์จาก propertyRepository โดยใช้ propertyId ที่ได้รับมา
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    console.log('property', property);

    // ตรวจสอบว่า user และ property มีอยู่จริงหรือไม่
    if (user && property) {
      // เช็คว่า property ที่จะเพิ่มอยู่ใน likedProperties ของ user แล้วหรือยัง
      if (!user.likedProperties.some((p) => p.id === propertyId)) {
        //1) some เป็นฟังก์ชันที่ใช้ตรวจสอบว่าใน likedProperties มีอสังหาริมทรัพย์ไหนที่มี id ตรงกับ propertyId หรือไม่
        //2) ถ้าค้นหาแล้วไม่เจอ (! หมายถึง "ไม่") ก็จะหมายความว่าสามารถเพิ่มอสังหาริมทรัพย์นี้เข้าไปได้
        // #อธิบายเพิ่ม
        //1> user.likedProperties: นี่คือรายการอสังหาริมทรัพย์ที่ผู้ใช้กดชอบ (เช่น Condo A, House B)  เป็น array ที่เก็บข้อมูลอสังหาริมทรัพย์ที่ผู้ใช้ชอบ
        //2> some() ตรวจสอบว่า มีอย่างน้อยหนึ่งรายการ ใน array ที่ตรงตามเงื่อนไขที่เรากำหนด (และจะกลับค่าเพราะมี !)
        //3> ถ้า p.id ตรงกับ propertyId จะหมายความว่าอสังหาริมทรัพย์นี้เคยถูกกดชอบแล้ว

        user.likedProperties.push(property);
        // user.likedProperties.push(property) ถ้าผู้ใช้ยังไม่เคยกดชอบอสังหาริมทรัพย์นี้มาก่อน
        //จะทำการเพิ่มอสังหาริมทรัพย์นั้นเข้าไปในรายการชอบ

        return this.userRepository.save(user);
        // บันทึก user ที่มีการอัปเดตข้อมูลแล้วไปยังฐานข้อมูล
      }
    }

    // ถ้าไม่พบ user หรือ property ให้โยน error กลับไป
    throw new Error('User or Property not found');
  }
}
