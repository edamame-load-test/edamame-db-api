# Backend API Server for Edamame DB

- Provides external API endpoints for edamame client to interface with internal service pertaining to postgres database
- [ ] Should authenticate with user configured username and password
- Need the following endpoints:
  - [x] `GET /tests` -> returns all the test ids ([id1, id2, id3])
  - [x] `POST /tests` -> creates test id in the test ids table for a new test and returns it 
- ToDo:
  - [ ] `DELETE /tests` -> not sure if this is the right method/path? Does a `pg_dump` to get all the data into an S3 bucket so we can take the whole system down.
  - [ ] `GET /metrics/:test_id` -> returns all the metrics for a particular test

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

`POST /tests` -> creates new test id and returns it

Example return:

```json
{
    "id": 5
}
```
