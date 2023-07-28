import { 
  ARCHIVE
} from "../constants/constants.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const aws = {
  createArchiveDesc: (testName) => {
    return `"Load test data. Test name: ${testName}"`;
  },

  configureCredentials: async () => {
    await exec(
      `aws configure set region ${process.env.AWS_REGION}`
    );
    await exec(
      `aws configure set aws_access_key_id ${process.env.AWS_ACCESS_KEY_ID}`
    );
    await exec(
      `aws configure set aws_secret_access_key ${process.env.AWS_SECRET_ACCESS_KEY}`
    );
  },

  ensureS3BucketIsSetup: async (uploadFile) => {
    let bucketExists = await aws.archiveBucketExists();
    if (!bucketExists) {
      await exec(`aws s3 mb s3://${ARCHIVE}`);
    }

    let fileExists = await aws.s3ObjectExists(uploadFile);
    if (fileExists) {
      throw new Error("S3 Object already exists for this test");
    }
  },

  s3ObjectExists: async (file) => {
    try {
      await exec(`aws s3api head-object --bucket ${ARCHIVE} --key ${file}`);
      return true;
    } catch (error) {
      if (error.stderr.match("Not Found")) {
        return false;
      } else { // unknown error; abort process
        throw Error(error);
      }
    }
  },

  archiveBucketExists: async () => {
    try {
      await exec(`aws s3 ls s3://${ARCHIVE}`);
      return true;
    } catch (error) {
      if (error.stderr.match("NoSuchBucket")) {
        return false;
      } else { // unknown error; abort process
        throw Error(error);
      }
    }
  },

  uploadToS3: async (file) => {
    const command = `aws s3 mv /var/pg_dump/${file} ` +
      `s3://${ARCHIVE} --storage-class STANDARD_IA`;
    await exec(command);
  }
};

export default aws;
