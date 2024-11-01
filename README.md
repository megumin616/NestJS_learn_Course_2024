
## สิ่งที่ทำใน project นี้
## Developer By Warathep (Ton)

This project is used by the following companies:

- Relationship Data แบบ OneToOne, OneToMany, ManyToMnay

- การทำ Seeding หรือ Factory data  แบบเพิ่มทีละอัน และ เพิ่มพร้อมๆกันกับการสุ่มข้อมูลจากตารางอื่นมาใส่ในตารางที่มีความสัมพันธุ์ โดย Factory แบบ fake ข้อมุลที่มีความสัมพันธุ์ไปพร้อมกันจะอยู่ที่ src/seeding/... 
    
    ส่วนการเพิ่มข้อมูลโดยตรงที หรือการเพิ่มข้อมูลของตารางที่ไม่มีความสัมพันธุ์ จะอธิบายละเอียดอยู่ใน src/testing/...
    ซึ่งการ factory ในไฟล์นี้จะเป็นการ factory แบบโดยตรง
    
    และได้อธิบายถึงพื้นฐาน class, instance ไว้ด้วย รวมถึงการใช้ static ซึ่งจำเป็นต้องรู้

- Pagination การแบ่งส่วนข้อมูลที่ไปดึงออกมา (skip, limit)

- การ hash password โดยใช้ bcrypt ทั้งสองแบบ ใช้ทั้งใน entity, service

- Authenticaion จะมีส่วน Login และจัดการข้อมูลผ่านการตรวจสอบ token เป็นการอธิบายอย่างละเอียด

