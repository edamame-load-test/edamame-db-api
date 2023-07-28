# Backend API Server for Edamame DB

Provides external API endpoints for edamame client to interface with internal postgres database.

To Dos:

- [ ] User authentication? (not needed for the moment due to port forwarding, no external IP will be exposed)
- Need the following endpoints:
  - [x] `GET /tests` -> returns all the tests
  - [x] `POST /tests` -> creates a new test with either custom name or randomly generated name and script, and returns the test
  - [x] `GET /tests/:id` -> returns the metadata associated with a specific test
  - [x] `PATCH /tests/:id` -> allows user to change some information about a test: its name, status, and end time
  - [x] `DELETE /tests/:id` -> deletes a test, and associated metrics, from the db
  - [x] `POST /tests/pg_dump/:testName ` -> sets up pg dump process by creating copy tables to store a single test's data at a time for a more manageable pg dump
- ToDo Later:
  - [ ] provide an endpoint that accepts some kind of `sql` file and runs it against the db

## Routes

[Get all tests](#get-a-list-of-all-tests)
[Create a new test](#create-a-new-test)
[Get an individual test](#get-an-individual-test)
[Update a test](#update-a-test)
[Delete a test](#deleting-a-test)

### Get a list of all tests

`GET /tests` -> returns all tests as objects representing their metadata. Tests with the most recent start time are at the beginning of the list.

Example response: `200 OK`

```json
[
  {
    "id": 12,
    "name": "69002d51-2c65-4e45-88d2-4a9dd1f3c0cb",
    "start_time": "2023-03-18T18:55:14.179Z",
    "end_time": "2023-03-18T19:01:05.214Z",
    "status": "completed",
    "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
  },
  {
    "id": 11,
    "name": "First Test",
    "start_time": "2023-03-18T18:54:51.611Z",
    "end_time": "2023-03-18T18:56:59.596Z",
    "status": "completed",
    "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
  }
]
```

---

### Create a new test

`POST /tests` -> Takes an optional name value and script value as JSON in request body, creates a new test, and returns it as JSON in the response body. If not given a name, will generate a random UUID to serve as the test name.

Example request body with custom name:

```json
{
  "name": "My Test",
  "script": "import http from 'k6/http';\nimport { check } from 'k6';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: '120s' },\n    { target: 0, duration: '30s' },\n  ],\n};\n\nexport default function () {\n  const result = http.get('https://test-api.k6.io/public/crocodiles/');\n  check(result, {\n    'http response status code is 200': result.status === 200,\n  });\n}"
}
```

Example response: `201 Created`

```json
{
  "id": 13,
  "name": "My Test",
  "start_time": "2023-03-18T19:07:08.391Z",
  "end_time": null,
  "status": "starting",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

Example request body with no custom name:

```json
{
  "script": "import http from 'k6/http';\nimport { check } from 'k6';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: '120s' },\n    { target: 0, duration: '30s' },\n  ],\n};\n\nexport default function () {\n  const result = http.get('https://test-api.k6.io/public/crocodiles/');\n  check(result, {\n    'http response status code is 200': result.status === 200,\n  });\n}"
}
```

Example response: `201 Created`

```json
{
  "id": 14,
  "name": "f589e6a4-65d3-44ce-8764-c0440314d3a6",
  "start_time": "2023-03-18T19:07:55.262Z",
  "end_time": null,
  "status": "starting",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

Notes:

- There are currently no checks in place to ensure `script` is present in the body. If no script is present, a test will be created with `null` as the script value.
- The script should be processed by `JSON.stringify()` or similar before sending, so it is not interpreted as code, otherwise, an error may be thrown.

---

### Get an individual test

`GET /tests/:id` -> Returns the test specified by the `id` URL path parameter.

Example response: `200 OK`

```json
{
  "id": 11,
  "name": "First Test",
  "start_time": "2023-03-18T18:54:51.611Z",
  "end_time": "2023-03-18T18:56:59.596Z",
  "status": "completed",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

If specified `id` does not exist or is in the incorrect format, returns a `404` response with the following message in the body:

```json
{
  "error": "Nonexistent or malformed test id"
}
```

---

### Update a test

`PUT /tests/:id` -> Takes either a name or status as JSON in the request body, updates the test specified by the `id` URL path parameter, and returns the updated test as JSON in the response body.

Example request to update name:

```json
{
  "name": "New test name!"
}
```

Example response: `200 OK`

```json
{
  "id": 12,
  "name": "New test name!",
  "start_time": "2023-03-18T18:55:14.179Z",
  "end_time": "2023-03-18T19:01:05.214Z",
  "status": "completed",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

Example request to update status:

```json
{
  "status": "running"
}
```

Example response: `200 OK`

```json
{
  "id": 14,
  "name": "f589e6a4-65d3-44ce-8764-c0440314d3a6",
  "start_time": "2023-03-18T19:07:55.262Z",
  "end_time": null,
  "status": "running",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

When updating a test status to `"completed"`, the `end_time` of the test is automatically updated.

Example request to change status to complete:

```json
{
  "status": "completed"
}
```

Example response: `200 OK`

```json
{
  "id": 14,
  "name": "f589e6a4-65d3-44ce-8764-c0440314d3a6",
  "start_time": "2023-03-18T19:07:55.262Z",
  "end_time": "2023-03-18T19:34:26.991Z",
  "status": "completed",
  "script": "import http from ''k6/http'';\nimport { check } from ''k6'';\n\nexport let options = {\n  stages: [\n    { target: 200, duration: ''120s'' },\n    { target: 0, duration: ''30s'' },\n  ],\n};\n\nexport default function () {\n  const result = http.get(''https://test-api.k6.io/public/crocodiles/'');\n  check(result, {\n    ''http response status code is 200'': result.status === 200,\n  });\n}"
}
```

Notes:

- Only one attribute change at a time is expected. As a result, `name` and `status` cannot be changed in the same patch request. If all values are present in the JSON body of the request, the name change will be prioritized first, leaving the status attribute unchanged.
- No other values (i.e. `id`, `script`, `start_time`, etc) can be changed via the API.
- If keys other than `name` and `status` are specified in the JSON request body, it will result in a `400 Bad Request` response with the following message:

```json
{
  "error": "Invalid or malformed data"
}
```

---

### Deleting a test

`DELETE /tests/:id` -> Deletes the test specified by the `id` URL path parameter in the database, and returns a `204 No Content` response. This is returned even if the `id` is not found.

---

### Archiving a test in an AWS S3 Bucket

`POST /tests/archive/:testName` -> Copies all test and samples data associated with the test whose name is `testName` into newly created separate tables for a pg dump. Subsequently, it performs a pg dump on the these separate tables to export the data for one test and its associated sample metrics. It leverages the AWS CLI to upload a compressed version of the pg dump file to an AWS S3 Bucket with the storage class S3 Standard Infrequent Access.

Example usage:
`POST /tests/archive/example`

Response: `201 OK`

```json
{
  "success": "Successfully archived a compressed pg dump file of the test: example to an AWS S3 Bucket with the S3 Standard Infrequent Access storage class."
}
```

Note:

- Must pass a valid existing test name in the path of the request.
- If the provided test name doesn't exist, a 400 status code will be returned along with the following body:

```json
{
  "error": "Cannot perform pg dump for the test: incorrectName, as there is no data associated with this test name."
}
```
