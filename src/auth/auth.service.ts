import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // ตรวจสอบผู้ใช้จาก email และ password
  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email); // ค้นหาผู้ใช้ด้วย email
    if (!user) throw new UnauthorizedException('User not found!'); // ถ้าไม่เจอผู้ใช้ ให้แจ้งข้อผิดพลาด

    const isPasswordMatch = await compare(password, user.password); // เปรียบเทียบ password ที่เข้ารหัสแล้ว
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid credentials'); // แจ้งข้อผิดพลาดถ้า password ไม่ตรงกัน

    // return { id: user.id }; // return id ของผู้ใช้หากข้อมูลถูกต้อง
    return user;
  }


  //ฟังก์ชันนี้ทำหน้าที่เหมือนกับ “การพิมพ์บัตรเข้าร่วมงาน” (Token) สำหรับผู้ใช้ที่เข้าสู่ระบบ โดยใช้ user ID ของผู้ใช้เป็นข้อมูลในการสร้างบัตร
  login(userId: number) {
    const payload: AuthJwtPayload = {sub: userId};
    //payload คือข้อมูลที่เราจะใส่ใน Token (เสมือนข้อมูลที่ปรากฏอยู่บนบัตรเข้าร่วมงาน)
    /* 
      AuthJwtPayload คือรูปแบบข้อมูลที่เราได้กำหนดไว้ล่วงหน้า โดยบอกว่า Payload 
      จะมีฟิลด์ชื่อ sub ที่เก็บ user ID ของผู้ใช้ (เสมือนการบอกว่า "นี่คือข้อมูลผู้ใช้ที่ถือบัตร")
    */
    return this.jwtService.sign(payload);
    //ฟังก์ชันนี้ทำหน้าที่ “ลงนาม” (sign) บน Payload ที่เราสร้างขึ้นเพื่อให้กลายเป็น Token
    //jwtService.sign(payload) เปรียบเสมือนการใส่ลายเซ็นลงบนบัตรเข้าร่วมงาน เพื่อทำให้บัตรนี้มีความถูกต้องและไม่สามารถปลอมแปลงได้
  }
}
