import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh-jwt') {
    // Guard นี้จะใช้กลยุทธ์ 'refresh-jwt' เพื่อตรวจสอบ refreshToken 
}