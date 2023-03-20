const request = require("supertest")
const { put } = require("./app.js")
const app = require('./app.js')
const tests = require("./models/tests.js")

describe("/tests path", () => {
  test("GET method responds with 200", async () => {
    const response = await request(app).get("/tests")
    expect(response.statusCode).toBe(200)
  })

  test("GET method returns JSON array", async () => {
    const response = await request(app).get("/tests")
    expect(Array.isArray(response.body)).toBe(true)
  })

  test("POST method responds with 201", async () => {
    const response = await request(app).post("/tests")
    const { id } = response.body
    expect(response.statusCode).toBe(201)
    await request(app).delete(`/tests/${id}`)
  })

  test("POST method creates newly created test with correct properties", async () => {
    const response = await request(app).post("/tests")
    const { id } = response.body
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('start_time')
    expect(response.body).toHaveProperty('end_time')
    expect(response.body).toHaveProperty('status')
    expect(response.body).toHaveProperty('script')
    await request(app).delete(`/tests/${id}`)
  })

  test("POST method can create a test with a custom name, if given", async () => {
    const response = await request(app).post("/tests").send({ name: "My Jest Test"})
    const { id } = response.body
    expect(response.body).toHaveProperty('name', 'My Jest Test')
    await request(app).delete(`/tests/${id}`)
  })
})

describe("/tests/:id path", () => {
  let id;

  beforeAll(async () => {
    const response = await request(app).post("/tests")
    id = response.body.id
  })

  test('GET method responds with 200', async () => {
    const response = await request(app).get(`/tests/${id}`);
    expect(response.statusCode).toBe(200);
  });

  test("GET method returns a test object with valid id", async () => {
    const response = await request(app).get(`/tests/${id}`)
    expect(response.body).toHaveProperty('id', id)
  })

  test("GET method returns 404 with error message with invalid id", async () => {
    const response = await request(app).get(`/tests/999999`)
    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty(
      'error',
      'Nonexistent or malformed test id'
    )
  })

  test("PUT method responds with 200", async () => {
    const response = await request(app)
      .put(`/tests/${id}`)
      .send({ name: 'change name' });
    expect(response.statusCode).toBe(200);
  })

  test("PUT method responds with changed name, when given", async () => {
    const response = await request(app)
      .put(`/tests/${id}`)
      .send({ name: 'change name' });
    expect(response.body).toHaveProperty('name', 'change name')
  })

  test("PUT method responds with changed status, when given", async () => {
    const response = await request(app)
      .put(`/tests/${id}`)
      .send({ status: 'running' });
    expect(response.body).toHaveProperty('status', 'running')
  })

  test("PUT method responds with 404 and error message with invalid id", async () => {
    const response = await request(app)
      .put(`/tests/999999`)
      .send({ name: 'change name' })
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      'error',
      'Nonexistent or malformed test id'
    );
  })

  test("PUT method responds with 400 and error message with invalid body", async () => {
    const response = await request(app).put(`/tests/${id}`)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or malformed data'
    )
  })

  afterAll(async () => {
    await request(app).delete(`/tests/${id}`)
  })
})