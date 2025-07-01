"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import mongoose from 'mongoose';
const config_1 = __importDefault(require("../../../config"));
const mongoose = config_1.default.tokenStoreType === 'mongodb' ? require('mongoose') : null;
if (config_1.default.tokenStoreType === 'mongodb') {
    mongoose.Promise = global.Promise;
    const userAndPassword = config_1.default.db.mongodbUser && config_1.default.db.mongodbPassword
        ? `${config_1.default.db.mongodbUser}:${config_1.default.db.mongodbPassword}@`
        : '';
    if (!config_1.default.db.mongoIsRemote) {
        mongoose.connect(`mongodb://${userAndPassword}${config_1.default.db.mongodbHost}:${config_1.default.db.mongodbPort}/${config_1.default.db.mongodbDatabase}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    else {
        mongoose.connect(config_1.default.db.mongoURLRemote, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
}
exports.default = mongoose;
