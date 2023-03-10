# Backend API Server for Edamame DB

- Provides external API endpoints for edamame client to interface with internal service pertaining to postgres database
- Should authenticate with user configured username and password
- Need the following endpoints:
  - `GET /tests` -> returns all the test ids ([id1, id2, id3])
  - `POST /tests` -> creates test id in the test ids table for a new test and returns it 
- Later:
  - `DELETE /tests` -> not sure if this is the right method/path? Does a `pg_dump` to get all the data into an S3 bucket so we can take the whole system down.
    - `GET /metrics/:test_id` -> returns all the metrics for a particular test
