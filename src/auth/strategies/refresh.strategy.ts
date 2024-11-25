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
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ดึง refreshToken จาก Header
      secretOrKey: refreshJwtConfiguration.secret, // ใช้กุญแจลับในการตรวจสอบความถูกต้องของโทเค็น
      ignoreExpiration: false, // ไม่ให้มองข้ามเวลาหมดอายุ
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.get("authorization").replace("Bearer", "").trim();
    const userId = payload.sub;
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
