# Backend API Server for Edamame DB

Provides external API endpoints for edamame client to interface with internal postgres database.

To Dos:

- [ ] User authentication? (not needed for the moment due to ingress rule)
- Need the following endpoints:
  - [x] `GET /tests` -> returns all the tests
  - [x] `POST /tests` -> creates a new test with either custom name or randomly generated name and script, and returns the test
  - [x] `GET /tests/:id` -> returns the metadata associated with a specific test
  - [x] `PATCH /tests/:id` -> allows user to change some information about a test: its name, status, and end time
  - [x] `DELETE /tests/:id` -> deletes a test, and associated metrics, from the db
  - [x] `POST /tests/archive/:testName ` -> ensures the AWS s3 bucket is setup (creates a bucket if one doesn't already exist) and uploads a single load test's data as an s3 object with the standard infrequent access storage class as a compressed tar file
  - [x] `POST /tests/import/:testName ` -> downloads AWS s3 object based on provided test name and copies the load test data stored within the s3 object into the postgres database

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

`POST /tests/archive/:testName` -> Creates a tar file that's ultimately a compressed version of .csv files that contain Postgres data associated with one load test that was exported from the Postgres database via COPY SQL statements. Subsequently, it uploads the compressed file as an s3 object to an AWS s3 bucket for longer term storage. The storage class of the s3 object upload is standard infrequent access, which offers cheaper access relative to some other S3 object storage classes, but also quick retrieval when the user wants to restore the data. If a user wants to use AWS Glacier storage instead (for even cheaper AWS cold storage), they can change the storage class of the uploaded load test s3 objects through the AWS CLI or the AWS console.

Example usage:
`POST /tests/archive/50kVus`

Response: `201 OK`

```json
{
  "success": "Successfully archived test: 50kVus in your edamame-load-tests AWS S3 Bucket."
}
```

Note:

- Must pass a valid existing test name in the path of the request.
- If the provided test name doesn't exist, a 400 status code will be returned along with the following body:

```json
{
  "error": "Cannot archive a nonexistent test: incorrectTestName."
}
```

### Importing a test from AWS S3 Bucket

`POST /tests/import/:testName` -> Downloads AWS s3 object associated with the test name provided, unzips the compressed file into .csvs containing data for the tests and samples tables, and then copies the contents of these .csvs into the Postgres database

Example usage:
`POST /tests/import/50kVus`

Response: `201 OK`

```json
{
  "success": "Successfully imported the test: 50kVus from your AWS S3 Bucket."
}
```

Notes:

- User must pass a valid test name that's associated with an existing s3 object.
- If data in the s3 object overlaps with data load test already existing in the Postgres database, then a 400 status code will be returned along with the following body:

```json
{
  "error": "Can't import duplicate load test information."
}
```

- If an s3 object doesn't exist with the provided test name, a 400 status code will be returned along with the following body:

```json
{
  "error": "Couldn't find S3 object associated with test: invalidTestName."
}
```
