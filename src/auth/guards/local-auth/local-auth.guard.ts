import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable() // ใช้ 'local' strategy ในการยืนยันตัวตน
export class LocalAuthGuard extends AuthGuard('local') {
/* ## ลำดับการทำงาน 2) ใน LocalAuthGuard นั้นสืบทอด (extends) มาจาก AuthGuard('local') 
ซึ่งบอกให้ Nest.js รู้ว่า "การตรวจสอบนี้จะใช้ local strategy จากนั้น AuthGuard('local') เรียกหา LocalStrategy*/ 
}



/*
Question?
 AuthGuard('local') จำเป็นต้องเขียน 'local' ไหม หรือเป็นคำอื่นๆก็ได้?
คำว่า 'local' เป็นการอ้างถึงชื่อของ strategy ที่ต้องการให้ AuthGuard ใช้ และ จำเป็นต้องตรงกับชื่อ strategy 
ที่ลงทะเบียนไว้ใน LocalStrategy เช่น LocalStrategy ของเราใช้ PassportStrategy(Strategy) 
ซึ่งถือว่าเป็นการใช้ "local strategy" โดยปริยาย (ตามการตั้งค่าใน Passport.js)
หากเปลี่ยน 'local' เป็นคำอื่นที่ไม่สอดคล้องกับชื่อ strategy เช่น 'jwt' หรือ 'custom' 
ระบบจะหาวิธีตรวจสอบตัวตนแบบนั้นไม่เจอและจะเกิดข้อผิดพลาด ทำให้การทำงานล้มเหลว
*/