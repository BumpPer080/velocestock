import { FiDownload, FiFileText } from 'react-icons/fi';

function Reports() {
  const handleDownloadExcel = () => {
    window.open('/api/export/excel', '_blank', 'noopener');
  };

  return (
    <div className="space-y-8">
      <section className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
        <div className="card-body space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">
                สร้างรายงาน
              </h2>
              <p className="text-sm text-base-content/70">
                ดาวน์โหลดรายงาน Excel ของสินค้าคงคลังทั้งหมดในระบบ
              </p>
            </div>
            <div className="btn btn-circle btn-ghost text-primary">
              <FiFileText className="text-2xl" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="btn btn-primary gap-2 uppercase tracking-wide"
            >
              <FiDownload className="text-base" />
              ดาวน์โหลด Excel
            </button>
          </div>
          <div className="rounded-box border border-error bg-error/10 p-4 text-sm text-base-content/70">
            ไฟล์ที่ส่งออกจะเป็นรายงานจาก VeloceStock ซึ่งประกอบด้วยข้อมูลสินค้าคงคลังทั้งหมดในระบบ
            ณ เวลาที่ทำการส่งออก คุณสามารถใช้ไฟล์นี้เพื่อวิเคราะห์ข้อมูลเพิ่มเติมหรือเก็บบันทึกตามความต้องการ
          </div>
        </div>
      </section>
    </div>
  );
}

export default Reports;

