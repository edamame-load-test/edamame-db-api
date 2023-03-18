# Backend API Server for Edamame DB

- Provides external API endpoints for edamame client to interface with internal service pertaining to postgres database
- [ ] User authentication
- Need the following endpoints:
  - [x] `GET /tests` -> returns all the tests
  - [x] `POST /tests` -> creates a new test with either custom name or randomly generated name and script, and returns the test
  - [x] `GET /tests/:id` -> returns the metadata associated with a specific test
  - [x] `PUT /tests/:id` -> allows user to change name of tests, and system can update start time, end time, and status
  - [x] `DELETE /tests/:id` -> deletes a test, and associated metrics, from the db
- ToDo Later:
  - [ ]  provide an endpoint that should do a `pg_dump` to get all the data into an S3 bucket so we can take the whole system down.
  - [ ] provide an endpoint that accepts some kind of `sql` file and runs it against the db

## Routes

`GET /tests` -> returns all tests as objects representing their metadata

Example return:

```json
[
    {
        "id": 9,
        "name": "test5",
        "start_time": "2023-03-17T21:02:31.255Z",
        "end_time": null,
        "status": "starting",
        "script": "function hello() { console.log(\"hello!\"); }"
    },
    {
        "id": 5,
        "name": "test1",
        "start_time": "2023-03-17T20:52:30.664Z",
        "end_time": "2023-03-17T20:53:56.792Z",
        "status": "starting",
        "script": "import http from 'k6/http';\\nimport { check } from 'k6';\\n\\nexport let options = {\\n  stages: [\\n    { target: 200, duration: '120s' },\\n    { target: 0, duration: '30s' },\\n  ],\\n};\\n\\nexport default function () {\\n  const result = http.get('https://test-api.k6.io/public/crocodiles/');\\n  check(result, {\\n    'http response status code is 200': result.status === 200,\\n  });\\n}"
    },
]
```

---

`POST /tests` -> creates new test id and returns it

Example return:

```json
{
    "id": 5
}
```
