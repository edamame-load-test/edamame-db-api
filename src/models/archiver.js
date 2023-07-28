import aws from "./aws.js";
import files from "./files.js";
import tests from "./tests.js";
import { 
  SINGLE_UPLOAD_MAX_SIZE
} from "../constants/constants.js";

const archiver = {
  archiveTest: async (test) => {
    let uploadFile = tests.s3ObjectNameForTest(test.name);
    await tests.dataDump(test.id, uploadFile);
    let uploadSize = await files.numBytes(`/var/pg_dump/${uploadFile}`);

    if (uploadSize > SINGLE_UPLOAD_MAX_SIZE) {
      let msg = `Archiving ${test.name} requires uploading more parts` +
        ` than the 10,000 subpart upload limit. Aborting archival.`;
      files.cleanUpDir("/var/pg_dump/");
      throw new Error(msg);
    }
    await aws.ensureS3BucketIsSetup(uploadFile);
    await aws.uploadToS3(uploadFile);
    files.cleanUpDir("/var/pg_dump/");
  }
};

export default archiver;
