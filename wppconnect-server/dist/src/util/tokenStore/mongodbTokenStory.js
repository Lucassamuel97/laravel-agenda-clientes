"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("./model/token"));
class MongodbTokenStore {
    constructor(client) {
        this.client = client;
    }
    tokenStore = {
        getToken: async (sessionName) => {
            let result = await token_1.default.findOne({ sessionName });
            if (result === null)
                return result;
            result = JSON.parse(JSON.stringify(result));
            result.config = JSON.parse(result.config);
            result.config.webhook = result.webhook;
            this.client.config = result.config;
            return result;
        },
        setToken: async (sessionName, tokenData) => {
            const token = new token_1.default(tokenData);
            token.sessionName = sessionName;
            token.webhook = this.client.config.webhook;
            token.config = JSON.stringify(this.client.config);
            const tk = await token_1.default.findOne({ sessionName });
            if (tk) {
                token._id = tk._id;
                return (await token_1.default.updateOne({ _id: tk._id }, token))
                    ? true
                    : false;
            }
            else {
                return (await token.save()) ? true : false;
            }
        },
        removeToken: async (sessionName) => {
            return (await token_1.default.deleteOne({ sessionName })) ? true : false;
        },
        listTokens: async () => {
            const result = await token_1.default.find();
            return result.map((m) => m.sessionName);
        },
    };
}
exports.default = MongodbTokenStore;
