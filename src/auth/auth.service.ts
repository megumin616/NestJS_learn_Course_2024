import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';

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

  //ฟังก์ชันนี้ทำหน้าที่เหมือนกับ “การพิมพ์บัตรเข้าร่วมงาน” (Token) สำหรับผู้ใช้ที่เข้าสู่ระบบ โดยใช้ user ID ของผู้ใช้เป็นข้อมูลในการสร้างบัตร
  login(userId: number) {
    const payload: AuthJwtPayload = { sub: userId }; // กำหนด payload ที่มี id ของผู้ใช้
    //payload คือข้อมูลที่เราจะใส่ใน Token (เสมือนข้อมูลที่ปรากฏอยู่บนบัตรเข้าร่วมงาน)
    /* 
      AuthJwtPayload คือรูปแบบข้อมูลที่เราได้กำหนดไว้ล่วงหน้า โดยบอกว่า Payload 
      จะมีฟิลด์ชื่อ sub ที่เก็บ user ID ของผู้ใช้ (เสมือนการบอกว่า "นี่คือข้อมูลผู้ใช้ที่ถือบัตร")
    */
    const token = this.jwtService.sign(payload); // สร้าง accessToken จาก payload
    const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig); // สร้าง refreshToken โดยใช้ refreshTokenConfig
    return {
      id: userId,
      token,
      refreshToken,
    };
    //ฟังก์ชันนี้ทำหน้าที่ “ลงนาม” (sign) บน Payload ที่เราสร้างขึ้นเพื่อให้กลายเป็น Token
    //jwtService.sign(payload) เปรียบเสมือนการใส่ลายเซ็นลงบนบัตรเข้าร่วมงาน เพื่อทำให้บัตรนี้มีความถูกต้องและไม่สามารถปลอมแปลงได้
  }

  // ฟังก์ชัน refreshToken ใช้สร้าง accessToken ใหม่เมื่อ refreshToken ถูกต้อง
  refreshToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const token = this.jwtService.sign(payload); // สร้าง accessToken ใหม่
    return {
      id: userId,
      token,
    };
  }
}
