import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('th-TH');
  } catch (error) {
    return value;
  }
};

function Checkout() {
  const { user } = useAuth();
  const [qrInput, setQrInput] = useState('');
  const [product, setProduct] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  const [lastDetectedCode, setLastDetectedCode] = useState('');
  const scannerRef = useRef(null);

  const canUseCamera = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const mediaDevices = window.navigator?.mediaDevices;
    return Boolean(mediaDevices && typeof mediaDevices.getUserMedia === 'function');
  }, []);

  const resetMessages = useCallback(() => {
    setLookupError('');
    setSuccessMessage('');
  }, []);

  const lookupProduct = useCallback(
    async (code) => {
      const trimmed = code.trim();
      if (!trimmed) {
        setProduct(null);
        setLookupError('กรุณาระบุ QR Code ของสินค้า');
        return;
      }

      setIsLookupLoading(true);
      resetMessages();
      try {
        const { data } = await axios.get('/api/checkouts/lookup', {
          params: { qr: trimmed },
        });
        setProduct(data);
        setQrInput(trimmed);
        setQuantity('1');
        setScannerActive(false);
        setLastDetectedCode(trimmed);
      } catch (error) {
        setProduct(null);
        setLookupError(error?.response?.data?.message || 'ไม่พบข้อมูลสินค้าสำหรับ QR นี้');
      } finally {
        setIsLookupLoading(false);
      }
    },
    [resetMessages],
  );

  const handleScanSuccess = useCallback(
    (rawValue) => {
      const detected = (rawValue || '').toString().trim();
      if (!detected || detected === lastDetectedCode) {
        return;
      }
      setLastDetectedCode(detected);
      lookupProduct(detected);
    },
    [lastDetectedCode, lookupProduct],
  );

  useEffect(() => {
    if (!canUseCamera || !scannerActive) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return undefined;
    }

    const scanner = new Html5QrcodeScanner(
      'checkout-qr-scanner',
      {
        fps: 8,
        qrbox: 240,
      },
      false,
    );

    scanner.render((decodedText) => handleScanSuccess(decodedText), () => {});
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [canUseCamera, scannerActive, handleScanSuccess]);

  const handleManualLookup = (event) => {
    event.preventDefault();
    lookupProduct(qrInput);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!product) {
      setLookupError('กรุณาค้นหาสินค้าก่อนทำการเบิก');
      return;
    }

    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      setLookupError('จำนวนที่ต้องการเบิกต้องมากกว่า 0');
      return;
    }

    resetMessages();
    setIsSubmitting(true);
    try {
      const payload = {
        qr: qrInput,
        quantity: numericQuantity,
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }
      const { data } = await axios.post('/api/checkouts', payload);
      setProduct(data.product);
      setSuccessMessage('บันทึกการเบิกเรียบร้อย');
      setQuantity('1');
      setNotes('');
      setScannerActive(false);
      setLastDetectedCode(qrInput);
    } catch (error) {
      setLookupError(error?.response?.data?.message || 'ไม่สามารถบันทึกการเบิกสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setQrInput('');
    setProduct(null);
    setQuantity('1');
    setNotes('');
    setScannerActive(true);
    setLastDetectedCode('');
    resetMessages();
  };

  if (user?.role !== 'staff') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-box border border-base-300 bg-base-100 p-10 text-center shadow-xl shadow-base-300/40">
        <FiCamera className="text-4xl text-warning" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-wide text-base-content">เฉพาะเจ้าหน้าที่คลังสินค้า</h2>
          <p className="text-sm text-base-content/70">
            หน้าเบิกสินค้าเปิดให้ผู้ใช้ Role <span className="font-semibold text-warning">staff</span> เท่านั้น เพื่อความปลอดภัยของข้อมูลสต็อก
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
          <div className="card-body space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">สแกน QR Code</h2>
                <p className="text-sm text-base-content/70">
                  ใช้กล้องมือถือหรือสแกนเนอร์ในการค้นหาสินค้าจาก QR ภายในคลัง
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm gap-2 text-base-content/70"
                onClick={() => {
                  if (scannerActive) {
                    setScannerActive(false);
                  } else {
                    setLastDetectedCode('');
                    resetMessages();
                    setScannerActive(true);
                  }
                }}
                disabled={!canUseCamera}
              >
                <FiRefreshCw className="text-base" />
                {scannerActive ? 'หยุดสแกน' : 'เริ่มสแกนใหม่'}
              </button>
            </div>
            <div className="overflow-hidden rounded-3xl border border-dashed border-primary/50 bg-base-200 p-3">
              {canUseCamera ? (
                scannerActive ? (
                  <div
                    id="checkout-qr-scanner"
                    className="h-100 w-full rounded-2xl bg-black/80"
                    aria-label="QR code scanner"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-base-content/60">
                    กด "เริ่มสแกนใหม่" เพื่อเปิดกล้องอีกครั้ง
                  </div>
                )
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-sm text-base-content/70">
                  <FiCamera className="text-3xl text-primary" />
                  <p>เบราว์เซอร์นี้ไม่รองรับการเปิดกล้องอัตโนมัติ สามารถใช้เครื่องสแกน QR หรือกรอก QR ด้านขวาแทนได้</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card border border-base-300 bg-base-100 shadow-xl shadow-base-300/40">
          <div className="card-body space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-wide text-base-content">รายละเอียดสินค้า</h2>
              <p className="text-sm text-base-content/70">สแกนหรือกรอก QR เพื่อค้นหาสินค้า จากนั้นระบุจำนวนที่ต้องการเบิก</p>
            </div>
            <form onSubmit={handleManualLookup} className="flex flex-col gap-3 sm:flex-row">
              <label className="flex-1 items-center gap-2 bg-base-100">
                <input
                  type="text"
                  value={qrInput}
                  onChange={(event) => setQrInput(event.target.value)}
                  placeholder="QR-YYYYMMDD-XXXXXX"
                  className="input input-primary w-full bg-transparent focus:outline-none"
                  autoComplete="off"
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary gap-2 uppercase tracking-wide"
                disabled={isLookupLoading}
              >
                {isLookupLoading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <FiSearch className="text-base" />
                )}
                ค้นหา
              </button>
            </form>

            {lookupError && (
              <div
                role="alert"
                className="alert alert-error border border-error border-opacity-20 bg-error/10 text-error-content"
              >
                <FiAlertCircle className="text-xl" />
                <span>{lookupError}</span>
              </div>
            )}

            {successMessage && (
              <div
                role="alert"
                className="alert alert-success border border-success border-opacity-20 bg-success/10 text-success-content"
              >
                <FiCheckCircle className="text-xl" />
                <span>{successMessage}</span>
              </div>
            )}

            {product && (
              <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                <h3 className="text-lg font-semibold text-base-content">{product.name || 'สินค้าไม่ระบุชื่อ'}</h3>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">QR Code</dt>
                    <dd className="font-semibold text-base-content">{product.qr_code}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">หมายเลขพัสดุ</dt>
                    <dd className="font-semibold text-base-content">{product.asset_code || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">หมวดหมู่</dt>
                    <dd className="font-semibold text-base-content">{product.category || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">คงเหลือ</dt>
                    <dd className="font-semibold text-base-content">
                      {product.quantity} {product.unit || ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">วันที่นำเข้า</dt>
                    <dd className="font-semibold text-base-content">{formatDate(product.import_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-base-content/50">สร้างโดย</dt>
                    <dd className="font-semibold text-base-content">
                      {product.created_by_name || product.created_by_username || '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-base-content/60" htmlFor="checkout-quantity">
                  จำนวนที่ต้องการเบิก
                </label>
                <input
                  id="checkout-quantity"
                  type="number"
                  min="1"
                  step="1"
                  className="input input-bordered bg-base-100"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={!product}
                />
                {product?.quantity !== undefined && (
                  <span className="text-xs text-base-content/60">
                    คงเหลือ {product.quantity} {product.unit || ''}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-base-content/60" htmlFor="checkout-notes">
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  id="checkout-notes"
                  className="textarea textarea-bordered min-h-[96px] bg-base-100"
                  placeholder="ระบุรายละเอียดงาน หรือผู้ขอเบิก"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={!product}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="btn btn-primary gap-2 uppercase tracking-wide"
                  disabled={!product || isSubmitting}
                >
                  {isSubmitting ? <span className="loading loading-spinner" /> : <FiCheckCircle className="text-base" />}
                  ยืนยันการเบิก
                </button>
                <button
                  type="button"
                  className="btn btn-ghost gap-2 uppercase tracking-wide text-base-content/70"
                  onClick={handleReset}
                >
                  <FiRefreshCw className="text-base" />
                  รีเซ็ตแบบฟอร์ม
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Checkout;
