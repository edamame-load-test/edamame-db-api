import aws from "./aws.js";
import files from "./files.js";
import tests from "./tests.js";
import {
  SINGLE_UPLOAD_MAX_SIZE,
  DEFAULT_STORAGE_CLASS,
  ARCHIVE,
} from "../constants/constants.js";

const archive = {
  exportToAWS: async (test, storageClass) => {
    try {
      const storage = archive.prepStorageClass(storageClass);
      const uploadFile = tests.s3ObjectNameForTest(test.name);
      await tests.dataDump(test.id, uploadFile);
      const uploadSize = await files.numBytes(`/var/pg_dump/${uploadFile}`);

      if (uploadSize > SINGLE_UPLOAD_MAX_SIZE) {
        throw new Error(archive.uploadSizeIssueMsg(test.name));
      }
      await aws.ensureS3BucketIsSetup(uploadFile);
      await aws.uploadToS3(`/var/pg_dump/${uploadFile}`, storage);
      files.cleanUpDir("/var/pg_dump/");
    } catch (error) {
      files.cleanUpDir("/var/pg_dump/");
      throw new Error(error);
    }
  },

  importFromAWS: async (testName) => {
    try {
      const s3ObjectName = tests.s3ObjectNameForTest(testName);
      const result = await aws.downloadS3Object(s3ObjectName);
      if (result.stdout.match("restore the object")) {
        return {
          statusCode: 400,
          message: { error: archive.restoreFirstMsg(testName) },
        };
      } else {
        const response = await archive.importToDatabase(testName, s3ObjectName);
        return response;
      }
    } catch (error) {
      files.cleanUpDir("/var/pg_dump/");
      throw Error(error);
    }
  },

  importToDatabase: async (testName, s3ObjectName) => {
    await files.unZip(s3ObjectName);
    await tests.importFromCsv();
    files.cleanUpDir("/var/pg_dump/");
    return {
      statusCode: 200,
      message: { success: archive.importSuccessMsg(testName) },
    };
  },

  storageClassRetrievalTypes: {
    STANDARD: "immediate",
    REDUCED_REDUNDANCY: "immediate",
    STANDARD_IA: "immediate",
    ONEZONE_IA: "immediate",
    INTELLIGENT_TIERING: "immediate",
    GLACIER: "restore_first",
    DEEP_ARCHIVE: "restore_first",
    GLACIER_IR: "immediate",
  },

  nonexistentTestMsg(testName) {
    return `Cannot archive a nonexistent test: ${testName}`;
  },

  prepStorageClass: (storageClass) => {
    if (storageClass === undefined) {
      return DEFAULT_STORAGE_CLASS;
    }

    if (archive.storageClassRetrievalTypes.hasOwnProperty(storageClass)) {
      return storageClass;
    } else {
      throw Error(`Invalid storage class specified: ${storageClass}`);
    }
  },

  restoreFirstMsg: (testName) => {
    return `The S3 object for the test ${testName} needs to be restored before it can be imported.`;
  },

  importSuccessMsg: (testName) => {
    return `Successfully imported the test ${testName} from your AWS S3 Bucket.`;
  },

  uploadSuccessMsg: (testName) => {
    return `Successfully archived test ${testName} in your ${ARCHIVE} AWS S3 Bucket.`;
  },

  unknownObjectMsg: (testName) => {
    return `Couldn't find S3 object associated with the test ${testName}`;
  },

  uploadSizeIssueMsg: (testName) => {
    return (
      `Archiving ${testName} requires uploading more parts` +
      ` than the 10,000 subpart upload limit. Aborting archival.`
    );
  },
};

export default archive;
