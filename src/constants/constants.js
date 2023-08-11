const CLUSTER_NAME = "edamame";
const ARCHIVE = "edamame-load-tests";
const SINGLE_UPLOAD_MAX_SIZE = 104857600; // 100 MiB
const MULTIPART_UPLOAD_MAX_SIZE = SINGLE_UPLOAD_MAX_SIZE * 10000;
const INVALID_NAME_ERROR_MSG =
  "Invalid or malformed data. Hint: Names must be unique and no longer than 80 chars";
const GET_TEST_ERROR_MSG = "Unable to retrieve test information";
const BAD_ID_ERROR_MSG = "Nonexistent or malformed test id";
const DEFAULT_STORAGE_CLASS = "STANDARD";
const DUPLICATE_IMPORT = "Can't import duplicate load test information";

export {
  CLUSTER_NAME,
  ARCHIVE,
  SINGLE_UPLOAD_MAX_SIZE,
  MULTIPART_UPLOAD_MAX_SIZE,
  INVALID_NAME_ERROR_MSG,
  GET_TEST_ERROR_MSG,
  BAD_ID_ERROR_MSG,
  DEFAULT_STORAGE_CLASS,
  DUPLICATE_IMPORT,
};
