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
  expect(files.cleanUpDir).toBeCalled();
  expect(aws.ensureS3BucketIsSetup).toHaveBeenCalledTimes(1);
  expect(aws.uploadToS3).toHaveBeenCalledTimes(1);
});

test("Ensure appropriate functions are called when downloading data from AWS S3 to database", async () => {
  const response = await archive.importToDatabase(sampleTest.name);
  expect(files.unZip).toHaveBeenCalledTimes(1);
  expect(tests.importFromCsv).toHaveBeenCalledTimes(1);
  expect(files.cleanUpDir).toBeCalled();
  expect(response.statusCode).toEqual(200);
  expect(response.message.success).toEqual(
    `Successfully imported the test ${sampleTest.name} from your AWS S3 Bucket.`
  );
});

test("Check error is thrown if unexpected storage class is passed", async () => {
  expect.assertions(1);
  try {
    await archive.prepStorageClass("random class");
  } catch (error) {
    expect(error.message).toEqual(
      "Invalid storage class specified: random class"
    );
  }
});

test("Ensure default standard storage class is returned if storage class query parameter is undefined", async () => {
  const storageClass = await archive.prepStorageClass(undefined);
  expect(storageClass).toEqual("STANDARD");
});

test("Ensure passed in storage class is returned if it's valid", async () => {
  const validClass = "REDUCED_REDUNDANCY";
  const storageClass = await archive.prepStorageClass(validClass);
  expect(storageClass).toEqual(validClass);
});

test("Ensure all expected AWS S3 storage classes are considered valid", async () => {
  const validClasses = archive.storageClassRetrievalTypes;
  expect(validClasses).toHaveProperty("STANDARD");
  expect(validClasses).toHaveProperty("REDUCED_REDUNDANCY");
  expect(validClasses).toHaveProperty("STANDARD_IA");
  expect(validClasses).toHaveProperty("ONEZONE_IA");
  expect(validClasses).toHaveProperty("INTELLIGENT_TIERING");
  expect(validClasses).toHaveProperty("GLACIER");
  expect(validClasses).toHaveProperty("DEEP_ARCHIVE");
  expect(validClasses).toHaveProperty("GLACIER_IR");
});
