import { faker } from "@faker-js/faker";
import { Property } from "../entities/property.entity";
import { setSeederFactory } from "typeorm-extension";


export const PropertyFactory = setSeederFactory(Property, () => {
    const property = new Property();
    property.name = faker.location.street();  // ชื่อถนนสมมุติ
    property.price = +faker.commerce.price({ min: 10000, max: 1000000 });  // ราคาสมมุติ
    property.description = faker.lorem.sentence();  // คำบรรยายสมมุติ
    return property;
});