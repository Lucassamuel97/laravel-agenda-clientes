"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FileTokenStore_1 = require("./FileTokenStore/FileTokenStore");
class FileTokenStore {
    constructor(client) {
        this.client = client;
    }
    tokenStore = new FileTokenStore_1.FileTokenStore({
        encodeFunction: (data) => {
            return this.encodeFunction(data, this.client.config);
        },
        decodeFunction: (text) => {
            return this.decodeFunction(text, this.client);
        },
    });
    encodeFunction(data, config) {
        data.config = config;
        return JSON.stringify(data);
    }
    async decodeFunction(text, client) {
        const object = JSON.parse(text);
        if (object.config && Object.keys(client.config).length === 0)
            client.config = object.config;
        if (object.webhook && Object.keys(client.config).length === 0)
            client.config.webhook = object.webhook;
        return object;
    }
}
exports.default = FileTokenStore;
