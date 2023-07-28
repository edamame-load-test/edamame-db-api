import request from "supertest";
import app from '../app.js';

describe("/tests path", () => {
  test("GET method responds with 200", async () => {
    const response = await request(app).get("/tests");
    expect(response.statusCode).toBe(200);
  });

  test("GET method returns JSON array", async () => {
    const response = await request(app).get("/tests");
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("POST method responds with 201", async () => {
    const response = await request(app).post("/tests");
    const { id } = response.body;
    expect(response.statusCode).toBe(201);
    await request(app).delete(`/tests/${id}`);
  });

  test("POST method creates newly created test with correct properties", async () => {
    const response = await request(app).post("/tests");
    const { id } = response.body;
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('start_time');
    expect(response.body).toHaveProperty('end_time');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('script');
    expect(response.body).toHaveProperty('archive_id');
    await request(app).delete(`/tests/${id}`);
  });

  test("POST method can create a test with a custom name, if given", async () => {
    const response = await request(app).post("/tests").send({ name: "My Jest Test"});
    const { id } = response.body;
    expect(response.body).toHaveProperty('name', 'My Jest Test');
    await request(app).delete(`/tests/${id}`);
  });

  test("POST method responds with 400 and error message with non-unique name", async () => {
    const response1 = await request(app).post("/tests").send({ name: "not unique"});
    const { id } = response1.body;
    const response2 = await request(app).post("/tests").send({ name: "not unique"});
    expect(response2.statusCode).toBe(400);
    expect(response2.body).toHaveProperty(
      'error',
      'Invalid or malformed data. Hint: Names must be unique and no longer than 80 chars'
    );
    await request(app).delete(`/tests/${id}`);
  });

  test("POST method response with 400 and error message with too long name", async () => {
    const name =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore ';
    const response = await request(app).post("/tests").send({ name });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or malformed data. Hint: Names must be unique and no longer than 80 chars'
    );
  });
});

describe("/tests/:id path", () => {
  let id;

  beforeAll(async () => {
    const response = await request(app).post("/tests");
    id = response.body.id;
  });

  test('GET method responds with 200', async () => {
    const response = await request(app).get(`/tests/${id}`);
    expect(response.statusCode).toBe(200);
  });

  test("GET method returns a test object with valid id", async () => {
    const response = await request(app).get(`/tests/${id}`);
    expect(response.body).toHaveProperty('id', id);
  });

  test("GET method returns 404 with error message with invalid id", async () => {
    const response = await request(app).get(`/tests/999999`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      'error',
      'Nonexistent or malformed test id'
    );
  });

  test("PATCH method responds with 200", async () => {
    const response = await request(app)
      .patch(`/tests/${id}`)
      .send({ name: 'change name' });
    expect(response.statusCode).toBe(200);
  });

  test("PATCH method responds with changed name, when given", async () => {
    const response = await request(app)
      .patch(`/tests/${id}`)
      .send({ name: 'change name again' });
    expect(response.body).toHaveProperty('name', 'change name again');
  });

  test("PATCH method responds with changed status, when given", async () => {
    const response = await request(app)
      .patch(`/tests/${id}`)
      .send({ status: 'running' });
    expect(response.body).toHaveProperty('status', 'running');
  });

  test("PATCH method responds with changed archive_id attribute, when given", async () => {
    const response = await request(app)
      .patch(`/tests/${id}`)
      .send({ archive_id: "random_string_id" });
    expect(response.body).toHaveProperty('archive_id', 'random_string_id');
  });

  test("PATCH method automatically assigns end_time when status is set to 'completed'", async () => {
    const response = await request(app)
      .patch(`/tests/${id}`)
      .send({ status: 'completed' });
    expect(response.body).toHaveProperty('status', 'completed');
    expect(response.body.end_time).toBeTruthy();
  });

  test("PATCH method responds with 404 and error message with invalid id", async () => {
    const response = await request(app)
      .patch(`/tests/999999`)
      .send({ status: 'test' })
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      'error',
      'Nonexistent or malformed test id'
    );
  });

  test("PATCH method responds with 400 and error message with invalid body", async () => {
    const response = await request(app).patch(`/tests/${id}`);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      'error',
      'Invalid or malformed data.'
    );
  });

  test("DELETE method responds with 204", async () => {
    const res = await request(app).post('/tests');
    const idToDelete = res.body.id;

    const response = await request(app).delete(`/tests/${idToDelete}`);
    expect(response.statusCode).toBe(204);
  });

  test("DELETE method should delete the associated test", async() => {
    const response = await request(app).post('/tests');
    const idToDelete = response.body.id;

    await request(app).delete(`/tests/${idToDelete}`);
    const res = await request(app).get('/tests');
    const tests = res.body;
    const ids = tests.map(test => test.id);
    expect(ids).not.toContain(idToDelete);
  });

  afterAll(async () => {
    await request(app).delete(`/tests/${id}`);
  });
});