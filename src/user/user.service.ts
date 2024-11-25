import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return await this.userRepository.update({id: userId}, {hashedRefreshToken})
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({
      where: {id},
      select: [ 'firstName', 'lastName', 'avatarUrl', 'hashedRefreshToken' ]
    });
  }

  async getProfile(id: number) {
    return this.userRepository.findOneBy({id});
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      }
    })
  }

  // ## การ hash password แบบที่ 2 โดยมีการ hash ใน service 
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password } = updateUserDto;
    const hash = await bcrypt.hash(password, 10);
    const update = {
      ...updateUserDto,
      password: hash
    }
    return await this.userRepository.update({id}, update)
  }

}
