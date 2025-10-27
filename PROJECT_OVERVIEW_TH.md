# ภาพรวมโครงการ VeloceStock

VeloceStock คือระบบบริหารจัดการคลังสินค้าแบบครบวงจร ที่ออกแบบมาเพื่อช่วยทีมงานภายในบริษัทติดตามสินค้าและอะไหล่อย่างเป็นระบบ โดยมีการแบ่งออกเป็นสามส่วนหลัก ได้แก่ Frontend, Backend และ Infrastructure เพื่อให้การพัฒนา การทดสอบ และการดีพลอยทำได้สะดวกแยกจากกันตามหน้าที่

## วัตถุประสงค์หลัก
- จัดเก็บข้อมูลสินค้าพร้อมรายละเอียด เช่น หมวดหมู่ หมายเลขพัสดุ วันที่นำเข้า และจำนวนคงเหลือ
- รองรับการจัดการสต็อก โดยอัปเดตจำนวนคงเหลืออัตโนมัติจากการปรับข้อมูลสินค้า
- สร้างรหัส QR เฉพาะให้สินค้าแต่ละชิ้น สำหรับใช้งานกับกระบวนการสแกนในอนาคต
- ออกรายงานสรุปในรูปแบบ Excel เพื่อใช้ประกอบการบริหารจัดการคลัง

## สถาปัตยกรรมและเทคโนโลยี
- **Frontend**: พัฒนาโดยใช้ React (Vite) และ TailwindCSS ให้ประสบการณ์ใช้งานที่ทันสมัย โดยมีหน้า Dashboard, Products และ Reports เป็นหน้าหลัก
- **Backend**: ใช้ Node.js (Express.js) เชื่อมต่อกับฐานข้อมูล MySQL ผ่านชั้น `models/` และเปิดให้บริการ API CRUD สำหรับสินค้า รวมถึงเอ็นด์พอยต์สำหรับสร้างไฟล์รายงานและดาวน์โหลด QR Code
- **ฐานข้อมูล**: โครงสร้างหลักประกอบด้วยตาราง `products` สำหรับข้อมูลสินค้า โดยทุกสินค้าเก็บ QR เฉพาะเพื่ออ้างอิงข้ามระบบได้แน่นอน
- **โครงสร้างไฟล์**: จัดเรียงตามโมดูลที่ระบุใน PRD (`backend/`, `frontend/`, `nginx.conf`) เพื่อให้การดูแลโค้ดและการดีพลอยผ่าน PM2 + Nginx ทำได้ง่าย

## ขั้นตอนการเริ่มต้นใช้งาน
1. ติดตั้ง Node.js 18+, npm 9+ และ MySQL 8+
2. ติดตั้ง dependencies ด้วย `npm install` ภายใต้โฟลเดอร์ `backend/` และ `frontend/`
3. คัดลอกไฟล์ `.env.example` ใน `backend/` เป็น `.env` และปรับค่าการเชื่อมต่อฐานข้อมูลให้สอดคล้องกับสภาพแวดล้อม
4. รันเซิร์ฟเวอร์พัฒนาด้วย `npm run dev` ทั้งใน `backend/` และ `frontend/`
5. ใช้งานฐานข้อมูลตาม schema ใน `PRD.md` พร้อม seed ตัวอย่างข้อมูลด้วย `npm run seed`


## การตั้งค่าและเชื่อมต่อฐานข้อมูล MySQL
1. **สร้างฐานข้อมูลและผู้ใช้**
   - เข้าสู่ MySQL ด้วยบัญชีผู้ดูแลระบบ แล้วรันคำสั่ง:
     ```sql
     CREATE DATABASE velocestock CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     CREATE USER 'velocestock'@'%' IDENTIFIED BY '<รหัสผ่านที่ปลอดภัย>';
     GRANT ALL PRIVILEGES ON velocestock.* TO 'velocestock'@'%';
     FLUSH PRIVILEGES;
     ```
   - หากรันบนเครื่องเดียวกับแอปพลิเคชันสามารถจำกัด Host เป็น `localhost` เพื่อความปลอดภัยเพิ่มเติม
2. **สร้างตารางหลัก**
   - ใช้สคริปต์ตาม schema ใน `PRD.md` หรือสร้างด้วยคำสั่งตัวอย่าง:
     ```sql
     USE velocestock;

     CREATE TABLE products (
       id INT AUTO_INCREMENT PRIMARY KEY,
       qr_code VARCHAR(50) NOT NULL UNIQUE,
       name VARCHAR(255) NOT NULL,
       category VARCHAR(100) NOT NULL,
       asset_code VARCHAR(100) NOT NULL,
       import_date DATE NOT NULL,
       quantity INT NOT NULL DEFAULT 0,
       unit VARCHAR(50) NOT NULL,
       image VARCHAR(255),
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     );

     ```
   - เพิ่มดัชนีเพิ่มเติมตามการค้นหาที่ใช้บ่อย เช่น `INDEX idx_products_asset_code (asset_code)` หากจำเป็น
3. **กำหนดค่าการเชื่อมต่อในแอป**
   - แก้ไขไฟล์ `.env` ใน `backend/` ให้สอดคล้องกับค่าที่สร้าง:
     ```bash
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=velocestock
     DB_USER=velocestock
     DB_PASSWORD=<รหัสผ่านที่ปลอดภัย>
     ```
   - ตรวจสอบว่าไฟล์ `backend/models/db.js` โหลดค่าจาก `.env` ผ่าน `dotenv` และใช้พารามิเตอร์เดียวกันนี้
4. **ทดสอบการเชื่อมต่อ**
   - รัน `npm run migrate` หรือสคริปต์ที่เตรียมไว้ (หากมี) เพื่อตรวจสอบการเชื่อมต่อและสร้างตารางอัตโนมัติ
   - ใช้คำสั่ง `npm run dev` ที่ฝั่ง Backend แล้วสังเกต log หากเชื่อมต่อสำเร็จจะมีข้อความยืนยัน หรือสามารถทดสอบด้วย `curl http://localhost:3000/api/products`
5. **การดูแลรักษา**
   - ตั้งค่าการสำรองข้อมูลอัตโนมัติ เช่น `mysqldump` รายวัน
   - กำหนดสิทธิ์เฉพาะการอ่านอย่างเดียวสำหรับบัญชีที่ใช้รายงาน เพื่อลดความเสี่ยงจากการแก้ไขข้อมูลโดยไม่ได้ตั้งใจ

## ความสามารถเด่นของระบบ
- ฟอร์มจัดการสินค้า (CRUD) พร้อมการอัปโหลดรูปภาพผ่าน `multer`
- การสร้าง QR Code ด้วยไลบรารี `qrcode` โดยระบบตั้งชื่อไฟล์ตามรูปแบบ `qr-<ISO_DATE>-<id>.png`
- ฟังก์ชัน Export รายงานด้วย `exceljs`
- รายงาน Dashboard สรุปยอดสินค้าทั้งหมด สินค้าใกล้หมด และรายการล่าสุด
- API สำหรับค้นหาและกรองสินค้า รวมถึงเรียกดูประวัติการเคลื่อนไหวแบบละเอียด

## การทดสอบและดีพลอย
- ฝั่ง Backend ใช้ Jest + Supertest (`npm test`), ส่วน Frontend ใช้ Vitest + React Testing Library (`npm test`)
- สำหรับการดีพลอย ให้ build frontend (`npm run build`) แล้วเสิร์ฟผ่าน Nginx ตามไฟล์ `nginx.conf` และรัน Backend ด้วย PM2 (`pm2 start index.js --name velocestock`)
- ควรตรวจสอบสิทธิ์โฟลเดอร์ `uploads/` และ `exports/` ให้เขียนได้ก่อนเปิดใช้งานจริง

ไฟล์นี้สรุปภาพรวมเพื่อช่วยให้ผู้ร่วมโครงการเข้าใจเป้าหมาย ฟีเจอร์ และขั้นตอนการใช้งานของระบบ VeloceStock ได้อย่างรวดเร็ว
