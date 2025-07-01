"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../../config"));
const db_1 = __importDefault(require("../../db/mongodb/db"));
const Token = config_1.default.tokenStoreType === 'mongodb'
    ? db_1.default.model('Token', new db_1.default.Schema({
        WABrowserId: String,
        WASecretBundle: String,
        WAToken1: String,
        WAToken2: String,
        webhook: String,
        config: String,
        sessionName: String,
    }))
    : null;
exports.default = Token;
