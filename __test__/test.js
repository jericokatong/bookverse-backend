const request = require('supertest');
const app = require('../app'); // Ganti dengan lokasi file aplikasi Anda

describe('Test API endpoints', () => {
  it('should return 200 OK for test api GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  // it('should return JSON format for GET /api', async () => {
  //   const res = await request(app).get('/api');
  //   expect(res.headers['content-type']).toEqual(expect.stringContaining('json'));
  // });

  it('should return 200 OK for register peminjam POST /authentication/register/peminjam with body', async () => {
    const requestBody = {
      name: 'Peminjam Testing',
      username: 'peminjamtesting1',
      password: '123456',
    }; // Data yang ingin Anda kirim
    const res = await request(app)
      .post('/authentication/register/peminjam')
      .send(requestBody); // Mengirim body dengan metode .send()
    expect(res.status).toBe(201);
  });
});
