import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from 'src/entities/property.entity';
import { PaginationPropertyDto } from './dto/paginatin-property.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  findAll(@Query() paginationPropertyDto: PaginationPropertyDto) {
    //paginationPropertyDto ซึ่งถูกดึงมาจาก query parameters ใน URL (เช่น /properties?skip=0&limit=10)
    // แต่ใน Thunder, Postman สามารถกำหนดค่าตรง Query โดยตรงได้เลย
    return this.propertyService.findAll(paginationPropertyDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(+id);
  }

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Patch(':id')
  update(@Param('id') id: string,@Body() updatePropertyDto:UpdatePropertyDto) {
    return this.propertyService.update(+id, updatePropertyDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.propertyService.delete(+id);
  }



  // request test many to many
  @Post(':userId/like/:propertyId')
  async likeProperty(@Param('userId') userId: number, @Param('propertyId') propertyId: number) {
    return await this.propertyService.likeProperty(userId, propertyId);
  }

}
