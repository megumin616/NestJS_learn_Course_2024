import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/*
extends
  ลองนึกถึง extends เหมือนกับการให้ เด็กคนหนึ่งรับเอานิสัยและทักษะจากพ่อแม่มา 
  เช่น หากพ่อแม่เป็นนักดนตรี เด็กคนนี้ก็อาจได้รับทักษะดนตรีติดตัวมา 
  ซึ่งเขาสามารถนำทักษะนี้ไปใช้หรือปรับปรุงเพิ่มเติมให้เป็นเอกลักษณ์ของตัวเองได้

  - LocalStrategy กำลังบอกว่า "ฉันจะสืบทอดคุณสมบัติและความสามารถที่มีใน PassportStrategy"
  - PassportStrategy เป็นคลาสใน Nest.js ที่จัดการกระบวนการยืนยันตัวตน (Authentication) ให้กับเราอยู่แล้ว 
    โดย Nest.js มีหลายวิธีให้เราใช้ยืนยันตัวตน เช่น Basic, JWT, หรือ OAuth
  
    สรุป: extends ช่วยให้เราสร้าง LocalStrategy ที่มีคุณสมบัติและฟังก์ชันการทำงานของ PassportStrategy ซึ่งทำให้ไม่ต้องเขียนใหม่ตั้งแต่ต้น
*/

 /* ## ลำดับการทำงาน 3) AuthGuard('local') จะรู้ว่าต้องใช้ local strategy ซึ่งระบบได้เชื่อมโยงไว้กับ LocalStrategy
      Nest.js และ Passport จะรู้โดยอัตโนมัติว่าให้เรียก LocalStrategy ที่มีคำสั่ง @Injectable()
 */ 
@Injectable() //1)  @Injectable(): ตรงนี้ทำให้ Nest.js เข้าใจว่า “คลาสนี้เป็นคนพิเศษ” และสามารถเรียกใช้งานได้จากหลาย ๆ ที่ในโปรแกรม
export class LocalStrategy extends PassportStrategy(Strategy) {
  //2) PassportStrategy(Strategy): Passport เป็นเหมือนยามรักษาความปลอดภัยที่คอยตรวจบัตร (ข้อมูลผู้ใช้) ทุกคนที่เข้ามา
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', 
      //3) ในบรรทัด super({ usernameField: 'email' }); เราบอกกับ Passport ว่า 
      //"เฮ้ ยามคนนั้น การตรวจบัตรผ่านให้เช็คที่ email นะ ไม่ใช่ชื่อผู้ใช้ทั่วไป"
    });
  }

  // ฟังก์ชัน validate ทำหน้าที่ตรวจสอบ email และ password
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}

/*
Question? 
usernameField: 'email' ทำไมถึงต้องกำหนด? ถ้าไม่กำหนดจะเป็นยังไง? (พร้อมการเปรียบเทียบ)
  การตั้งค่า usernameField: 'email' เป็นการบอกให้ LocalStrategy ใช้ email แทนค่าเริ่มต้นของ Passport.js ที่จะใช้ username 
  เป็นตัวตรวจสอบการล็อกอิน หากไม่ตั้งค่านี้ไว้ Passport.js จะพยายามหา username ใน request แทน ทำให้เกิดข้อผิดพลาดได้
  หากผู้ใช้ส่ง email มาสำหรับล็อกอิน

  เปรียบเทียบ: นึกภาพว่าในแบบฟอร์มการเข้าสู่ระบบของคุณมีช่องให้กรอก "Email" 
  แต่เจ้าหน้าที่ตรวจบัตรคิดว่ามันคือ "Username" และพยายามค้นหาชื่อนั้น แต่ชื่อที่ใช้หาไม่ตรงกัน 
  ทำให้การตรวจบัตรไม่สำเร็จ การตั้ง usernameField: 'email' ก็เหมือนการบอกให้เจ้าหน้าที่ว่า 
  ช่อง "Email" ที่ส่งเข้ามานั้นจะถือว่าเป็น "Username" เพื่อให้การตรวจสอบสำเร็จตามข้อมูลที่มี

*/


/*
Question?
ถ้าเปลี่ยนชื่อฟังก์ชัน validate ใน LocalStrategy เป็นอย่างอื่น การทำงานจะยังทำงานได้อยู่ไหม?
  ไม่สามารถเปลี่ยนชื่อฟังก์ชัน validate เป็นอย่างอื่นได้ เพราะ Passport.js คาดหวังให้มีฟังก์ชัน validate 
  สำหรับการตรวจสอบข้อมูลการเข้าสู่ระบบ ฟังก์ชัน validate นี้เป็นฟังก์ชันที่ Passport.js เรียกใช้งานโดยอัตโนมัติ 
  หากเปลี่ยนชื่อเป็นอย่างอื่น Passport.js จะไม่พบฟังก์ชันนั้น และการตรวจสอบการเข้าสู่ระบบจะล้มเหลว
 */
