import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig from "../config/jwt.config";
import { AuthJwtPayload } from "../types/auth-jwtPayload";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConfig.KEY) private jwtConfiguration: ConfigType<typeof jwtConfig>
        /* @Inject(jwtConfig.KEY): เป็นการใช้ @Inject decorator เพื่อระบุให้ NestJS 
            ทราบว่าเราต้องการดึงค่า configuration ที่เกี่ยวข้องกับ JWT มาจาก jwtConfig 
            ซึ่งกำหนดค่าไว้ในไฟล์ configuration (อาจจะอยู่ใน .env หรือไฟล์คอนฟิกอื่นที่ NestJS ใช้) */
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  
            // ระบุว่าจะดึง JWT มาจาก Authorization header ของ Request ในรูปแบบ Bearer token (Authorization: Bearer <JWT>)
            
            secretOrKey: jwtConfiguration.secret, // ใช้ secret สำหรับตรวจสอบความถูกต้องของ JWT
            //ใช้ secret ที่ตั้งไว้ใน jwt.config.ts เพื่อใช้ในการตรวจสอบความถูกต้องของ JWT ที่ได้รับ 
            //(ทำหน้าที่เหมือนกับ “รหัสลับ” สำหรับตรวจสอบว่า JWT มาจากระบบที่น่าเชื่อถือ)

            ignoreExpiration: false,
        });
    }

    validate(payload: AuthJwtPayload) { // ตรวจสอบ payload ของ token
        return { id: payload.sub }; // คืนค่า id ของผู้ใช้ เพื่อใช้งานใน request ภายหลัง
    }
}
