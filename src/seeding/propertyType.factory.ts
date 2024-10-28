import { faker } from '@faker-js/faker';
import { PropertyType } from '../entities/propertyType.entity';
import { setSeederFactory } from 'typeorm-extension';

export const PropertyTypeFactory = setSeederFactory(PropertyType, () => {
  const propertyTypeFactory = new PropertyType();
  propertyTypeFactory.value = faker.company.name();
  return propertyTypeFactory;
});
