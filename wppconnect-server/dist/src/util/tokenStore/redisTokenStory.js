"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const db_1 = __importDefault(require("../db/redis/db"));
const functions_1 = require("../functions");
class RedisTokenStore {
    constructor(client) {
        this.client = client;
        let prefix = config_1.default.db.redisPrefix || '';
        if (prefix === 'docker') {
            prefix = (0, functions_1.getIPAddress)();
        }
    }
    tokenStore = {
        getToken: (sessionName) => new Promise((resolve, reject) => {
            db_1.default.get(this.prefix + sessionName, (err, reply) => {
                if (err) {
                    return reject(err);
                }
                const object = JSON.parse(reply);
                if (object) {
                    if (object.config && Object.keys(this.client.config).length === 0)
                        this.client.config = object.config;
                    if (object.webhook &&
                        Object.keys(this.client.config).length === 0)
                        this.client.config.webhook = object.webhook;
                }
                resolve(object);
            });
        }),
        setToken: (sessionName, tokenData) => new Promise((resolve) => {
            tokenData.sessionName = sessionName;
            tokenData.config = this.client.config;
            db_1.default.set(this.prefix + sessionName, JSON.stringify(tokenData), (err) => {
                return resolve(err ? false : true);
            });
        }),
        removeToken: (sessionName) => new Promise((resolve) => {
            db_1.default.del(this.prefix + sessionName, (err) => {
                return resolve(err ? false : true);
            });
        }),
        listTokens: () => new Promise((resolve) => {
            db_1.default.keys(this.prefix + '*', (err, keys) => {
                if (err) {
                    return resolve([]);
                }
                keys.forEach((item, indice) => {
                    if (this.prefix !== '' && item.includes(this.prefix)) {
                        keys[indice] = item.substring(item.indexOf(this.prefix) + this.prefix.length);
                    }
                });
                return resolve(keys);
            });
        }),
    };
}
exports.default = RedisTokenStore;
