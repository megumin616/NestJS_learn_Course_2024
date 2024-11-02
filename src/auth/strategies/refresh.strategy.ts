import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import refreshJwtConfig from "../config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import { AuthJwtPayload } from "../types/auth-jwtPayload";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ดึง refreshToken จาก Header
      secretOrKey: refreshJwtConfiguration.secret, // ใช้กุญแจลับในการตรวจสอบความถูกต้องของโทเค็น
      ignoreExpiration: false, // ไม่ให้มองข้ามเวลาหมดอายุ
    });
  }

  validate(payload: AuthJwtPayload) {
    // คืนค่า id ของผู้ใช้จาก payload เพื่อใช้ในการสร้าง accessToken ใหม่
    return { id: payload.sub };
  }
}
