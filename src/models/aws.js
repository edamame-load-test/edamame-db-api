import { ARCHIVE } from "../constants/constants.js";
import { promisify } from "util";
import child_process from "child_process";
const exec = promisify(child_process.exec);

const aws = {
  createArchiveDesc: (testName) => {
    return `"Load test data. Test name: ${testName}"`;
  },

  configureCredentials: async () => {
    await exec(`aws configure set region ${process.env.AWS_REGION}`);
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
      } else {
        // unknown error; abort process
        throw Error(error);
      }
    }
  },

  downloadS3Object: async (objectName) => {
    return exec(
      `cd /var/pg_dump && aws s3 cp s3://${ARCHIVE}/${objectName} ./${objectName}`
    );
  },

  archiveBucketExists: async () => {
    try {
      await exec(`aws s3 ls s3://${ARCHIVE}`);
      return true;
    } catch (error) {
      if (error.stderr.match("NoSuchBucket")) {
        return false;
      } else {
        // unknown error; abort process
        throw Error(error);
      }
    }
  },

  uploadToS3: async (filePath, storageClass) => {
    await exec(
      `aws s3 mv ${filePath} s3://${ARCHIVE} --storage-class ${storageClass}`
    );
  },
};

export default aws;
