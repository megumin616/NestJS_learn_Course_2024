import { InjectRepository } from '@nestjs/typeorm';
import { CreateTestingDto } from './dto/create-testing.dto';
import { UpdateTestingDto } from './dto/update-testing.dto';
import { Testing } from './entities/testing.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TestingFactory } from './seeding/testing.factory';

@Injectable()
export class TestingService {
  constructor(@InjectRepository(Testing) private testingRepository: Repository<Testing>) {}

  async create(createTestingDto: CreateTestingDto) {
    const test = await this.testingRepository.save(createTestingDto);
    return test;
  }

  async createFactory(value: number) {
    const testFactory = await TestingFactory.createTestings(value);
    return await this.testingRepository.save(testFactory);
  }

  findAll() {
    return this.testingRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} testing`;
  }

  update(id: number, updateTestingDto: UpdateTestingDto) {
    return `This action updates a #${id} testing`;
  }

  remove(id: number) {
    return `This action removes a #${id} testing`;
  }
}
