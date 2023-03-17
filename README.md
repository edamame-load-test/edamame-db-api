# Backend API Server for Edamame DB

- Provides external API endpoints for edamame client to interface with internal service pertaining to postgres database
- [ ] User authentication
- Need the following endpoints:
  - [x] `GET /tests` -> returns all the tests
  - [x] `POST /tests` -> creates test id in the test ids table for a new test and returns it
  - [ ] `GET /tests/:id` -> returns the metadata associated with a specific test
  - [ ] `PATCH /tests/:id` -> allows user to change name of tests, and system can update start time, end time, and status
  - [ ] `DELETE /tests/:id` -> deletes a test, and associated metrics, from the db
  - ToDo:
  - [ ]  provide an endpoint that should do a `pg_dump` to get all the data into an S3 bucket so we can take the whole system down.
  - [ ] provide an endpoint that accepts some kind of `sql` file and runs it against the db

## Routes

`GET /tests` -> returns all test ids

Example return:

```json
[
    {
        "id": 1
    },
    {
        "id": 2
    },
    {
        "id": 3
    },
    {
        "id": 4
    }
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
