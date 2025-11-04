import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import Checkout from '../pages/Checkout.jsx';

vi.mock('axios');
vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: () => {},
    clear: vi.fn().mockResolvedValue(undefined),
  })),
}));
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

const { useAuth: mockedUseAuth } = await import('../context/AuthContext.jsx');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Checkout page', () => {
  it('guards access for non-staff users', () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'admin' } });

    render(<Checkout />);

    expect(
      screen.getByText((content) => content.includes('เฉพาะเจ้าหน้าที่คลังสินค้า')),
    ).toBeInTheDocument();
  });

  it('requires QR code before lookup', async () => {
    mockedUseAuth.mockReturnValue({ user: { role: 'staff' } });
    axios.get.mockResolvedValueOnce({ data: {} });

    render(<Checkout />);

    const submitButton = screen.getByRole('button', { name: 'ค้นหา' });
    fireEvent.submit(submitButton.closest('form'));

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('กรุณาระบุ QR Code ของสินค้า')),
      ).toBeInTheDocument();
    });
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('fetches product info and performs checkout', async () => {
    mockedUseAuth.mockReturnValue({ user: { id: 10, role: 'staff' } });

    axios.get.mockResolvedValueOnce({
      data: {
        id: 1,
        qr_code: 'QR-20251015-000123',
        name: 'ตลับลูกปืน',
        quantity: 5,
        unit: 'ชิ้น',
      },
    });

    axios.post.mockResolvedValueOnce({
      data: {
        product: {
          id: 1,
          qr_code: 'QR-20251015-000123',
          name: 'ตลับลูกปืน',
          quantity: 3,
          unit: 'ชิ้น',
        },
        checkout: {
          id: 99,
          quantity: 2,
        },
      },
    });

    render(<Checkout />);

    fireEvent.change(screen.getByPlaceholderText('QR-YYYYMMDD-XXXXXX'), {
      target: { value: 'QR-20251015-000123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'ค้นหา' }).closest('form'));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/checkouts/lookup', {
        params: { qr: 'QR-20251015-000123' },
      });
    });

    fireEvent.change(
      screen.getByLabelText((content) => content.includes('จำนวนที่ต้องการเบิก')),
      {
        target: { value: '2' },
      },
    );
    fireEvent.change(
      screen.getByLabelText((content) => content.includes('หมายเหตุ')),
      {
        target: { value: 'งานซ่อมบำรุง' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันการเบิก' }));

    await waitFor(() => {
      const successAlert = document.querySelector('.alert-success');
      expect(successAlert).not.toBeNull();
      const remainingSpans = Array.from(document.querySelectorAll('span')).filter((node) =>
        node.textContent?.includes('คงเหลือ'),
      );
      expect(remainingSpans.some((node) => node.textContent.includes('3'))).toBe(true);
    });
  });
});
