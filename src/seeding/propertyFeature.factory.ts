import { faker } from "@faker-js/faker";
import { PropertyFeature } from "../entities/propertyFeature.entity";
import { setSeederFactory } from "typeorm-extension";

export const PropertyFeatureFactory = setSeederFactory(PropertyFeature, () => {
    const propertyFeature = new PropertyFeature();
    propertyFeature.area = faker.number.int({ min: 25, max: 2500 });  // พื้นที่สมมุติ
    propertyFeature.bedrooms = faker.number.int({ min: 1, max: 5 });  // จำนวนห้องนอนสมมุติ
    propertyFeature.parkingSpots = faker.number.int({ min: 1, max: 3 });  // ที่จอดรถสมมุติ
    propertyFeature.hasBalcony = faker.datatype.boolean();  // ระเบียงมีหรือไม่มี
    propertyFeature.hasGardenYeard = faker.datatype.boolean();  // สวนหย่อมมีหรือไม่มี
    propertyFeature.hasSwimmingPool = faker.datatype.boolean();  // สระว่ายน้ำมีหรือไม่มี
    return propertyFeature;
});