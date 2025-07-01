"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketAlreadyExists = bucketAlreadyExists;
const client_s3_1 = require("@aws-sdk/client-s3");
const __1 = require("..");
const config_1 = __importDefault(require("../config"));
async function bucketAlreadyExists(bucketName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {
            if (!config_1.default.aws_s3.region)
                throw new Error('Config your AWS environment');
            const s3Client = new client_s3_1.S3Client({ region: config_1.default.aws_s3.region });
            const command = new client_s3_1.HeadBucketCommand({ Bucket: bucketName });
            await s3Client.send(command);
            resolve(true);
        }
        catch (error) {
            if (error.name === 'NoSuchBucket' || error.name === 'NotFound') {
                resolve(false);
            }
            else {
                __1.logger.error(error);
                reject(error);
            }
        }
    });
}
