คุณคือผู้ช่วยนักพัฒนา (Full-Stack Developer)
โปรดสร้างระบบเว็บแอปพลิเคชันตามรายละเอียดด้านล่างนี้ให้ครบทุกฟีเจอร์
ใช้เทคโนโลยีดังนี้:

Frontend: React (Vite) + TailwindCSS
Backend: Node.js (Express.js)
Database: MySQL
Deployment: Nginx + PM2 (Server ภายใน LAN)
QR Code: ใช้ไลบรารี qrcode เพื่อสร้าง QR Code เฉพาะของสินค้า
Export: ใช้ exceljs เพื่อสร้างรายงาน Excel
ระบบต้องพร้อมรันได้จริง มีโครงสร้างไฟล์ชัดเจน และมี API ครบถ้วนตาม PRD ด้านล่าง
พร้อมหน้า UI เบื้องต้น (Dashboard, Products, Reports)

สร้างระบบบริหารจัดการ สินค้าและอะไหล่ภายในบริษัท
ให้สามารถ:
เพิ่ม แก้ไข ลบ และค้นหาสินค้าได้
แสดงข้อมูลสต็อกปัจจุบัน
สร้าง QR Code เฉพาะสินค้าแต่ละชิ้น (Unique) เพื่อรองรับการสแกนเบิกในอนาคต
ออกรายงานสรุปเป็น Excel ได้
ใช้งานภายในเครือข่าย LAN ของบริษัท

| ส่วน        | เทคโนโลยี                  | หมายเหตุ                          |
| ----------- | -------------------------- | --------------------------------- |
| Frontend    | React (Vite) + TailwindCSS | UI สวย ทันสมัย ใช้งานง่าย         |
| Backend     | Node.js (Express.js)       | API หลัก เชื่อมต่อฐานข้อมูล       |
| Database    | MySQL                      | เก็บข้อมูลสินค้า                    |
| QR Code     | ไลบรารี `qrcode`           | สร้างภาพ QR เฉพาะสินค้า           |
| File Upload | `multer`                   | สำหรับอัปโหลดรูปสินค้า            |
| Export      | `exceljs`                  | สำหรับสร้างรายงาน Excel           |
| Deployment  | Nginx + PM2                | ใช้รันระบบใน server ภายใน         |
| Login UI    | `styled-components`        | ใช้สร้างหน้า Login แบบ custom    |

ฟีเจอร์หลัก
หมวด	รายละเอียด
1. Dashboard	แสดงสรุปจำนวนสินค้าทั้งหมด, สินค้าใกล้หมด, รายการเพิ่มล่าสุด
2. การจัดการสินค้า (Products CRUD)	เพิ่ม / แก้ไข / ลบ / ดูสินค้า โดยระบุ:
- ชื่อสินค้า
- ประเภทสินค้า
- หมายเลขพัสดุ
- วันที่นำเข้า
- จำนวนคงเหลือ
- หน่วยนับ
- รูปภาพ
- QR Code เฉพาะ (Unique)
4. รายงาน (Reports)	สรุปข้อมูลสินค้าและสินค้าใกล้หมด
สามารถดาวน์โหลดรายงาน Excel ได้
5. ค้นหา / กรองข้อมูล	ค้นหาสินค้าตามชื่อ, หมวดหมู่, หมายเลขพัสดุ, วันที่นำเข้า
6. ระบบ QR Code	สร้าง QR เฉพาะให้ทุกสินค้าที่เพิ่ม เช่น QR-20251015-000123
และแสดงภาพ QR ในหน้ารายละเอียดสินค้า
7. (อนาคต)	ระบบเบิกสินค้าด้วยการสแกน QR ผ่านกล้องมือถือหรืออุปกรณ์สแกนเนอร์
8. ระบบบัญชีผู้ใช้ (User Management)	ผู้ดูแลสามารถสร้าง/แก้ไข/ลบบัญชี พร้อมกำหนด role (admin, staff)
9. ระบบเข้าสู่ระบบ (Authentication)	พนักงานเข้าสู่ระบบด้วย Username/Password เพื่อรับ JWT ใช้งาน API
10. บันทึกประวัติผู้ใช้งาน (Audit Trail)	เก็บ Log การเข้าสู่ระบบและผู้ที่เพิ่ม/แก้ไขสินค้าแต่ละครั้ง
11. หน้าเข้าสู่ระบบ (Login UI)	มีหน้า Login แบบ custom (ไฟล์ `Login.jsx`) ใช้ styled-components ตามดีไซน์ต้นฉบับ พร้อมแจ้ง error และสถานะการโหลด
12. หน้าตรวจสอบกิจกรรมสินค้า (Product Activity)	หน้า UI สำหรับผู้ดูแลระบบ ตรวจสอบประวัติการจัดการสินค้า พร้อมบอก role และรายละเอียดการกระทำ
13. หน้าจัดการผู้ใช้ (User Management)	ผู้ดูแลสร้าง/แก้ไข/ลบบัญชี กำหนด role และรีเซ็ตรหัสผ่านผ่าน UI โดยตรง

โครงสร้างฐานข้อมูล (Database Schema)
ตาราง products
ชื่อคอลัมน์	ประเภท	รายละเอียด
id	INT (PK, AUTO_INCREMENT)	รหัสสินค้า
qr_code	VARCHAR(50)	รหัส QR เฉพาะ (Unique)
name	VARCHAR(255)	ชื่อสินค้า
category	VARCHAR(100)	ประเภทสินค้า
asset_code	VARCHAR(100)	หมายเลขพัสดุ
import_date	DATE	วันที่นำเข้า
quantity	INT	จำนวนคงเหลือ
unit	VARCHAR(50)	หน่วยนับ
image	VARCHAR(255)	ชื่อไฟล์ภาพสินค้า
created_by	INT (FK → users.id, NULLABLE)	อ้างถึงผู้ใช้ที่สร้างสินค้า
created_at	DATETIME	วันที่บันทึก
updated_at	DATETIME	วันที่แก้ไขล่าสุด

ตาราง users
ชื่อคอลัมน์	ประเภท	รายละเอียด
id	INT (PK, AUTO_INCREMENT)	รหัสผู้ใช้
username	VARCHAR(100)	บัญชีผู้ใช้ (Unique)
password_hash	VARCHAR(255)	รหัสผ่านแบบ Hash (bcrypt)
display_name	VARCHAR(255)	ชื่อที่ใช้แสดงในระบบ
role	ENUM('admin','staff')	สิทธิ์การใช้งาน
created_at	DATETIME	วันที่สร้าง
updated_at	DATETIME	วันที่แก้ไขล่าสุด

ตาราง login_logs
ชื่อคอลัมน์	ประเภท	รายละเอียด
id	BIGINT (PK, AUTO_INCREMENT)	รหัส Log
user_id	INT (FK → users.id)	อ้างถึงผู้ใช้ที่เข้าสู่ระบบ
ip_address	VARCHAR(45)	ที่อยู่ IP (IPv4/IPv6)
user_agent	TEXT	ข้อมูลอุปกรณ์/เบราว์เซอร์
logged_in_at	DATETIME	เวลาที่เข้าสู่ระบบ

ตาราง product_activity_logs
ชื่อคอลัมน์	ประเภท	รายละเอียด
id	BIGINT (PK, AUTO_INCREMENT)	รหัส Log
product_id	INT (FK → products.id)	อ้างถึงสินค้าที่มีการเปลี่ยนแปลง
user_id	INT (FK → users.id, NULLABLE)	ผู้ใช้ที่ทำรายการ
action	VARCHAR(50)	ประเภทการกระทำ (create, update, delete ฯลฯ)
details	TEXT	ข้อมูลเพิ่มเติม (JSON/ข้อความ)
created_at	DATETIME	เวลาที่บันทึกกิจกรรม

โครงสร้างไฟล์ระบบ
VeloceStock/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── users.js
│   ├── models/
│   │   ├── activityModel.js
│   │   ├── db.js
│   │   ├── productModel.js
│   │   └── userModel.js
│   ├── uploads/
│   │   ├── images/
│   │   └── qrcodes/
│   ├── exports/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProductActivity.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── Products.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductTable.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   └── package.json
│
├── nginx.conf
└── README.md

API Specification
Method	Endpoint	คำอธิบาย
GET	/api/products	ดึงข้อมูลสินค้าทั้งหมด
GET	/api/products/:id	ดึงรายละเอียดสินค้า
POST	/api/products	เพิ่มสินค้าใหม่ (สร้าง QR อัตโนมัติ)
PUT	/api/products/:id	แก้ไขสินค้า
DELETE	/api/products/:id	ลบสินค้า
GET	/api/products/:id/qrcode	ดาวน์โหลดไฟล์ QR
GET	/api/products/activity	ดึงประวัติกิจกรรมสินค้า (admin-only)
GET	/api/export/excel	ดาวน์โหลดรายงาน Excel
POST	/api/auth/login	เข้าสู่ระบบ รับ JWT เพื่อนำไปใช้ใน API อื่น
GET	/api/auth/me	ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบปัจจุบัน
GET	/api/users	ดึงรายการผู้ใช้ทั้งหมด (เฉพาะ admin)
POST	/api/users	สร้างผู้ใช้ใหม่ (เฉพาะ admin)
GET	/api/users/:id	ดูรายละเอียดผู้ใช้ (เฉพาะ admin)
PUT	/api/users/:id	อัปเดตผู้ใช้ (เฉพาะ admin)
DELETE	/api/users/:id	ลบผู้ใช้ (เฉพาะ admin)

User Flow
เข้าสู่ระบบ → รับ JWT → แนบ Authorization Bearer เพื่อเรียก API ที่ต้องการสิทธิ์
เพิ่มสินค้าใหม่ → ระบบสร้าง QR Code เฉพาะ
ดูรายการสินค้า → เห็น QR Code แต่ละรายการ และทราบว่าใครเป็นผู้สร้าง
บันทึกรายการเบิก → ลดจำนวนคงเหลือในสินค้า
สร้างรายงาน → ดาวน์โหลดรายงาน Excel
ตรวจสอบ Log → ผู้ดูแลดูประวัติการเข้าสู่ระบบและกิจกรรมสินค้าย้อนหลังได้
ตรวจสอบกิจกรรมสินค้า → ผู้ดูแลเปิดหน้า Product Activity เพื่อตรวจสอบ role และรายละเอียดการดำเนินการ
จัดการผู้ใช้ → ผู้ดูแลสร้าง/แก้ไข/ลบบัญชี ผ่านหน้า User Management และระบบออก token อัตโนมัติ
(อนาคต) → สแกน QR เพื่อเบิกสินค้าโดยอัตโนมัติ

// ตาม PRD.md สร้างโครงสร้าง Express + React สำหรับระบบ Veloce Stock
