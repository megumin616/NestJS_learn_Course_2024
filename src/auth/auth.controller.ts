import { Controller, HttpCode, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // กำหนดสถานะ HTTP 200 (OK) เมื่อ login สำเร็จ
  /* ## ลำดับการทำงาน 1) เมื่อมีการเรียกใช้ @UseGuards(LocalAuthGuard) ใน auth.controller.ts ระบบจะดึง LocalAuthGuard มาใช้ */ 
  @UseGuards(LocalAuthGuard) // ใช้ LocalAuthGuard ในการยืนยันตัวตน
  @Post('login') // กำหนด route /auth/login สำหรับการเข้าสู่ระบบ
  async login(@Request() req) { 
    return this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post("signout")
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
  }
  
}

/* 
  สรุปการเชื่อมโยง
    @UseGuards(LocalAuthGuard) > LocalAuthGuard > AuthGuard('local') > LocalStrategy

  Question?  
    ทำไมถึงต้องไปที่ LocalAuthGuard ก่อน ทำไมไม่ไปที่ LocalStrategy เลย?
  Answer
    ลองนึกภาพว่าคุณกำลังจะไปเข้าร่วมงานสัมมนาที่มีการตรวจสอบบัตรเข้าร่วมงาน โดยมีการทำงานที่เป็นระเบียบแบบนี้
      1) @UseGuards (การแสดงความต้องการเข้าสัมมนา)
          - เหมือนกับคุณที่ยืนอยู่ที่ทางเข้าและยกมือขึ้นเพื่อบอกเจ้าหน้าที่ว่า "ฉันต้องการเข้าร่วมงานสัมมนา" นี่คือการใช้ @UseGuards 
          เพื่อระบุว่าเราจะใช้ระบบการตรวจสอบตัวตนแบบเฉพาะ (ในที่นี้คือ LocalAuthGuard)

      2) LocalAuthGuard (เจ้าหน้าที่ตรวจบัตรที่ประตู)
          - เจ้าหน้าที่ที่ประตูทำหน้าที่ตรวจสอบว่าคุณมีสิทธิ์เข้าไปหรือไม่ โดยเขาจะตรวจสอบบัตรประชาชนหรือบัตรเข้าร่วมงานของคุณ 
            ซึ่งในกรณีนี้เขาได้รับคำสั่งให้ใช้กฎ (หรือ strategy) ที่เรียกว่า "local"
          - เจ้าหน้าที่ (LocalAuthGuard) จะถามคำถามเพื่อให้แน่ใจว่าคุณมีสิทธิ์เข้าร่วมงาน ซึ่งในที่นี้คือการตรวจสอบ email และ password

      3) local (กฎการเข้าร่วมงาน)
          - กฎที่เจ้าหน้าที่ใช้ในการตรวจสอบคุณ เช่น "ถ้าชื่อในบัตรตรงกับชื่อที่ลงทะเบียนในระบบ และรหัสผ่านก็ตรงกัน ก็ให้ผ่าน" 
            ซึ่งคือการใช้ local strategy ที่กำหนดไว้

      4) extends (การยืมความสามารถจากกฎอื่น)
          - เจ้าหน้าที่ (LocalAuthGuard) ได้เรียนรู้จากกฎที่มีอยู่แล้ว (AuthGuard) ว่าจะต้องทำอย่างไรในการตรวจสอบบัตรผู้เข้าร่วมงาน 
            ซึ่งทำให้เขาไม่ต้องคิดเองทั้งหมดและสามารถใช้กฎที่มีอยู่แล้วได้

      5) LocalStrategy (ผู้เชี่ยวชาญด้านการตรวจสอบ)
          - ถ้าเจ้าหน้าที่พบว่ามีข้อสงสัยในการตรวจสอบ เขาจะเรียกผู้เชี่ยวชาญที่รู้เรื่องการตรวจสอบบัตรเข้าร่วมงาน (LocalStrategy) 
            เพื่อให้ช่วยยืนยันว่าข้อมูลในบัตรถูกต้องจริงหรือไม่ เช่น เขาจะตรวจสอบข้อมูลในระบบว่าชื่อที่คุณให้ตรงกับฐานข้อมูลหรือไม่

*/