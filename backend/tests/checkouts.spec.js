import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/productModel.js', () => ({
  findProductByQr: jest.fn(),
  findProductById: jest.fn(),
}));
jest.unstable_mockModule('../models/checkoutModel.js', () => ({
  checkoutProductByQr: jest.fn(),
}));
jest.unstable_mockModule('../models/activityModel.js', () => ({
  recordProductActivity: jest.fn(),
}));

const checkoutRoutesModule = await import('../routes/checkouts.js');
const productModel = await import('../models/productModel.js');
const checkoutModel = await import('../models/checkoutModel.js');
const activityModel = await import('../models/activityModel.js');

const checkoutRoutes = checkoutRoutesModule.default;

const createApp = (user) => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (user) {
      req.user = user;
    }
    next();
  });
  app.use('/api/checkouts', checkoutRoutes);
  return app;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Checkout routes', () => {
  it('requires authentication for lookup', async () => {
    const app = createApp();

    const response = await request(app).get('/api/checkouts/lookup');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('requires QR code for lookup', async () => {
    const app = createApp({ id: 1, role: 'staff' });

    const response = await request(app).get('/api/checkouts/lookup');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('QR code is required');
  });

  it('returns product details for a valid QR lookup', async () => {
    const app = createApp({ id: 1, role: 'staff' });
    productModel.findProductByQr.mockResolvedValue({ id: 1, qr_code: 'QR-1', name: 'Widget' });

    const response = await request(app).get('/api/checkouts/lookup').query({ qr: 'QR-1' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, qr_code: 'QR-1', name: 'Widget' });
    expect(productModel.findProductByQr).toHaveBeenCalledWith('QR-1');
  });

  it('rejects checkout without authentication', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/checkouts')
      .send({ qr: 'QR-1', quantity: 1 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('rejects checkout with invalid quantity', async () => {
    const app = createApp({ id: 2, role: 'staff' });

    const response = await request(app)
      .post('/api/checkouts')
      .send({ qr: 'QR-1', quantity: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Quantity must be greater than zero');
  });

  it('handles business rule errors from checkout model', async () => {
    const app = createApp({ id: 3, role: 'staff' });
    const error = new Error('Insufficient stock');
    error.status = 409;
    checkoutModel.checkoutProductByQr.mockRejectedValue(error);

    const response = await request(app)
      .post('/api/checkouts')
      .send({ qr: 'QR-1', quantity: 5 });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Insufficient stock');
    expect(activityModel.recordProductActivity).not.toHaveBeenCalled();
  });

  it('completes checkout and records activity', async () => {
    const app = createApp({ id: 4, role: 'staff' });

    checkoutModel.checkoutProductByQr.mockResolvedValue({
      product: {
        id: 10,
        qr_code: 'QR-10',
        name: 'Bolt',
        quantity: 7,
      },
      checkout: {
        id: 55,
        productId: 10,
        userId: 4,
        quantity: 2,
        notes: 'Maintenance job',
        createdAt: '2025-11-03T05:00:00.000Z',
      },
    });

    const response = await request(app)
      .post('/api/checkouts')
      .send({ qr: 'QR-10', quantity: 2, notes: 'Maintenance job' });

    expect(response.status).toBe(201);
    expect(response.body.product).toMatchObject({ id: 10, quantity: 7 });
    expect(response.body.checkout).toMatchObject({ id: 55, quantity: 2 });
    expect(checkoutModel.checkoutProductByQr).toHaveBeenCalledWith({
      qrCode: 'QR-10',
      quantity: 2,
      userId: 4,
      notes: 'Maintenance job',
    });
    expect(activityModel.recordProductActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 10,
        userId: 4,
        action: 'checkout',
      }),
    );
  });
});
