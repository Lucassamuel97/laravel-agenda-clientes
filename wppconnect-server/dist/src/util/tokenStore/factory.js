"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const fileTokenStory_1 = __importDefault(require("./fileTokenStory"));
const mongodbTokenStory_1 = __importDefault(require("./mongodbTokenStory"));
const redisTokenStory_1 = __importDefault(require("./redisTokenStory"));
class Factory {
    createTokenStory(client) {
        let myTokenStore;
        const type = config_1.default.tokenStoreType;
        if (type === 'mongodb') {
            myTokenStore = new mongodbTokenStory_1.default(client);
        }
        else if (type === 'redis') {
            myTokenStore = new redisTokenStory_1.default(client);
        }
        else {
            myTokenStore = new fileTokenStory_1.default(client);
        }
        return myTokenStore.tokenStore;
    }
}
exports.default = Factory;
