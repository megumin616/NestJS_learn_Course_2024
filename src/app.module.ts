import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pgConfig } from 'dbConfig';
import { PropertyModule } from './property/property.module';
import { TestingModule } from './testing/testing.module';
import { mysqlConfig } from 'mysqlConfig';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';

dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot(pgConfig),
    PropertyModule,
    TestingModule,
    UserModule,
    AuthModule,
  ], //PostgareSQL
  // imports: [
  //   TypeOrmModule.forRoot(mysqlConfig),
  //   PropertyModule,
  //   TestingModule,
  //   LeadersModule,
  //   CitiesModule,
  //   CountriesModule,
  //   TimezonesModule,
  // ], //Mysql
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
