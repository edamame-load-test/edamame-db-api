import aws from "../models/aws.js";
import files from "../models/files.js";
import archive from "../models/archive.js";
import tests from "../models/tests.js";

const sampleTest = { name: "example", id: 1 };
jest.mock("../models/tests.js");
jest.mock("../models/files.js");
jest.mock("../models/aws.js");

test("Ensure appropriate functions are called when backing up load test data into AWS S3", async () => {
  await archive.exportToAWS(sampleTest.name);
  expect(tests.dataDump).toHaveBeenCalledTimes(1);
  expect(files.numBytes).toHaveBeenCalledTimes(1);
  expect(aws.ensureS3BucketIsSetup).toHaveBeenCalledTimes(1);
  expect(aws.uploadToS3).toHaveBeenCalledTimes(1);
  expect(files.cleanUpDir).toHaveBeenCalledTimes(1);
});

test("Ensure appropriate functions are called when downloading data from AWS S3", async () => {
  await archive.importFromAWS(sampleTest.name);
  expect(aws.downloadS3Object).toHaveBeenCalledTimes(1);
  expect(files.unZip).toHaveBeenCalledTimes(1);
  expect(tests.importFromCsv).toHaveBeenCalledTimes(1);
});
