import aws from "./aws.js";
import files from "./files.js";
import tests from "./tests.js";
import { SINGLE_UPLOAD_MAX_SIZE } from "../constants/constants.js";

const archive = {
  exportToAWS: async (test) => {
    const uploadFile = tests.s3ObjectNameForTest(test.name);
    await tests.dataDump(test.id, uploadFile);
    const uploadSize = await files.numBytes(`/var/pg_dump/${uploadFile}`);

    if (uploadSize > SINGLE_UPLOAD_MAX_SIZE) {
      let msg =
        `Archiving ${test.name} requires uploading more parts` +
        ` than the 10,000 subpart upload limit. Aborting archival.`;
      files.cleanUpDir("/var/pg_dump/");
      throw new Error(msg);
    }
    await aws.ensureS3BucketIsSetup(uploadFile);
    await aws.uploadToS3(`/var/pg_dump/${uploadFile}`);
    files.cleanUpDir("/var/pg_dump/");
  },

  importFromAWS: async (testName) => {
    try {
      const s3ObjectName = tests.s3ObjectNameForTest(testName);
      await aws.downloadS3Object(s3ObjectName);
      await files.unZip(s3ObjectName);
      await tests.importFromCsv();
      files.cleanUpDir("/var/pg_dump/");
    } catch (error) {
      files.cleanUpDir("/var/pg_dump/");
      throw Error(error);
    }
  },
};

export default archive;
