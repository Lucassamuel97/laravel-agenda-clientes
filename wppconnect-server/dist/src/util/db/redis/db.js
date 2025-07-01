"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../../config"));
const redis = config_1.default.tokenStoreType === 'redis' ? require('redis') : null;
let RedisClient = null;
if (config_1.default.tokenStoreType === 'redis') {
    RedisClient = redis.createClient(config_1.default.db.redisPort, config_1.default.db.redisHost, {
        password: config_1.default.db.redisPassword,
        db: config_1.default.db.redisDb,
    });
}
exports.default = RedisClient;
