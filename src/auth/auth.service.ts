import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
     /* @Inject(refreshJwtConfig.KEY) เป็น Decorator ที่ใช้ในการบอก Nest.js ว่าต้องการนำเข้าค่า config 
        ที่ถูกตั้งชื่อด้วย refreshJwtConfig.KEY 
      refreshJwtConfig เป็นโมดูลที่ใช้ในการเก็บค่าคอนฟิกที่เกี่ยวข้องกับ refreshToken โดยมีการกำหนดค่าเช่น secret และ expiresIn 
      ซึ่งถูกใช้ในการสร้างและตรวจสอบ refreshToken*/
      private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    /* ConfigType คือประเภทที่ใช้ในการระบุว่าเรากำลังนำเข้าข้อมูลจากการกำหนดค่าคอนฟิก ซึ่งในที่นี้คือการดึงค่าที่เกี่ยวข้องกับ refreshToken 
      จากไฟล์ refresh-jwt.config.ts */
  ) {}

  // ตรวจสอบผู้ใช้จาก email และ password
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email); // ค้นหาผู้ใช้ด้วย email
    if (!user) throw new UnauthorizedException('User not found!'); // ถ้าไม่เจอผู้ใช้ ให้แจ้งข้อผิดพลาด

    const isPasswordMatch = await compare(password, user.password); // เปรียบเทียบ password ที่เข้ารหัสแล้ว
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials'); // แจ้งข้อผิดพลาดถ้า password ไม่ตรงกัน

    // return { id: user.id }; // return id ของผู้ใช้หากข้อมูลถูกต้อง
    return user;
  }

  //## ver ก่อนที่จะทำ revoke token
  //ฟังก์ชันนี้ทำหน้าที่เหมือนกับ “การพิมพ์บัตรเข้าร่วมงาน” (Token) สำหรับผู้ใช้ที่เข้าสู่ระบบ โดยใช้ user ID ของผู้ใช้เป็นข้อมูลในการสร้างบัตร
  // login(userId: number) {
  //   const payload: AuthJwtPayload = { sub: userId }; // กำหนด payload ที่มี id ของผู้ใช้
  //   //payload คือข้อมูลที่เราจะใส่ใน Token (เสมือนข้อมูลที่ปรากฏอยู่บนบัตรเข้าร่วมงาน)
  //   /*
  //     AuthJwtPayload คือรูปแบบข้อมูลที่เราได้กำหนดไว้ล่วงหน้า โดยบอกว่า Payload
  //     จะมีฟิลด์ชื่อ sub ที่เก็บ user ID ของผู้ใช้ (เสมือนการบอกว่า "นี่คือข้อมูลผู้ใช้ที่ถือบัตร")
  //   */
  //   const token = this.jwtService.sign(payload); // สร้าง accessToken จาก payload
  //   const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig); // สร้าง refreshToken โดยใช้ refreshTokenConfig
  //   return {
  //     id: userId,
  //     token,
  //     refreshToken,
  //   };
  //   //ฟังก์ชันนี้ทำหน้าที่ “ลงนาม” (sign) บน Payload ที่เราสร้างขึ้นเพื่อให้กลายเป็น Token
  //   //jwtService.sign(payload) เปรียบเสมือนการใส่ลายเซ็นลงบนบัตรเข้าร่วมงาน เพื่อทำให้บัตรนี้มีความถูกต้องและไม่สามารถปลอมแปลงได้
  // }

  //## ver หลังทำ revoke token
  async login(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload), //สร้าง access token ที่มีอายุการใช้งานสั้น เช่น 15 นาที
      this.jwtService.signAsync(payload, this.refreshTokenConfig), //สร้าง refresh token ซึ่งมักมีอายุการใช้งานยาวกว่า เช่น 7 วัน
      //this.refreshTokenConfig อาจเก็บข้อมูลเกี่ยวกับการตั้งค่า เช่น secret key, expiration time เป็นต้น
      //ใช้ signAsync ถ้าต้องการให้ระบบพร้อมสำหรับอนาคต รองรับการทำงาน async และไม่บล็อก event loop
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  //## ver ก่อนทำ revoke token
  // ฟังก์ชัน refreshToken ใช้สร้าง accessToken ใหม่เมื่อ refreshToken ถูกต้อง
  // refreshToken(userId: number) {
  //   const payload: AuthJwtPayload = { sub: userId };
  //   const token = this.jwtService.sign(payload); // สร้าง accessToken ใหม่
  //   return {
  //     id: userId,
  //     token,
  //   };
  // }

  //## ver หลังทำ revoke token
  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    // ค้นหาผู้ใช้จาก userId
    const user = await this.userService.findOne(userId);

    // ตรวจสอบว่า user นั้นมีอยู่ในระบบหรือไม่ หรือไม่มี hashedRefreshToken
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // ตรวจสอบว่า refreshToken ที่ส่งมานั้นตรงกับ hashedRefreshToken ในระบบหรือไม่
    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    // ถ้า refresh token ไม่ตรง ก็โยนข้อผิดพลาด UnauthorizedException
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // ถ้าทุกอย่างถูกต้องก็ return userId
    return { id: userId };
  }

  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }
}
