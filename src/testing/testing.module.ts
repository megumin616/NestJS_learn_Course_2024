import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testing } from './entities/testing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Testing])],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
