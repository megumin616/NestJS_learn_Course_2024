import { faker } from '@faker-js/faker';
import { User } from '../entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(User, () => {
  const user = new User();
  user.firstName = faker.person.firstName();  // ชื่อจริงสมมุติ
  user.lastName = faker.person.lastName();  // นามสกุลสมมุติ
  user.email = faker.internet.email();  // อีเมลสมมุติ
  user.avatarUrl = faker.image.avatar();  // รูปโปรไฟล์สมมุติ
  return user;
});
