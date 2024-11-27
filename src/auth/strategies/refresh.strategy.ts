import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import refreshJwtConfig from "../config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import { AuthJwtPayload } from "../types/auth-jwtPayload";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    //ConfigType<typeof refreshJwtConfig> คือตัวที่ช่วยให้ TypeScript รู้จักชนิดของข้อมูลที่ดึงมาจากคอนฟิก
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ดึง refreshToken จาก Header
      secretOrKey: refreshJwtConfiguration.secret, // ใช้กุญแจลับในการตรวจสอบความถูกต้องของโทเค็น
      ignoreExpiration: false, // ไม่ให้มองข้ามเวลาหมดอายุ
      passReqToCallback: true,
      //passReqToCallback: true: บอกให้ Passport ส่ง Request ไปยัง Callback 
      //(ฟังก์ชัน validate) เพื่อให้สามารถเข้าถึงข้อมูลจาก HTTP Request ได้
    });
  }

  //ฟังก์ชัน validate จะถูกเรียกหลังจากที่ JWT ถูกตรวจสอบเรียบร้อยแล้ว
  validate(req: Request, payload: AuthJwtPayload) {
    //ดึงค่า Authorization Header จาก Request มาและทำการ แยก "Bearer" ออกเพื่อให้เหลือแค่ Refresh Token
    const refreshToken = req.get("authorization").replace("Bearer", "").trim();
    //.get("authorization"): ใช้เพื่อดึงค่าของ Authorization Header ที่ส่งมาจาก Client
    //Authorization Header โดยทั่วไปจะมีค่ารูปแบบเช่นนี้:  Authorization: Bearer <refresh_token>
    //.replace("Bearer", ""): ใช้เพื่อ ลบคำว่า "Bearer" ออกจาก Authorization Header ที่ถูกดึงออกมา
    //.trim(): ใช้เพื่อลบ ช่องว่าง (whitespace) ที่อาจจะมีอยู่ ก่อนหน้า หรือ หลังสุด ของ Token หลังจากที่คำว่า "Bearer" ถูกลบออก
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
