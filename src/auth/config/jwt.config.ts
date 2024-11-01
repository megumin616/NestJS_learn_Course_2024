import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: 'secretKey',
    signOptions: {
      expiresIn: '1h',
    },
  }),
);
