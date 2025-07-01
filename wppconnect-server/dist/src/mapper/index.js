"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = convert;
const json_mapper_json_1 = __importDefault(require("json-mapper-json"));
async function convert(prefix, data, event) {
    try {
        data.event = event || data.event;
        event = data.event.indexOf('message') >= 0 ? 'message' : data.event;
        const mappConfEvent = await config_event(prefix, event);
        const mappConfType = await config_type(prefix, event, data.type);
        Object.assign(mappConfEvent, mappConfType);
        // console.log('mappConfEvent', mappConfEvent);
        if (!mappConfEvent)
            return data;
        return await (0, json_mapper_json_1.default)(data, mappConfEvent);
    }
    catch (e) {
        return data;
    }
}
async function config_event(prefix, event) {
    try {
        const { default: mappConf } = await Promise.resolve(`${`./${prefix}${event}.js`}`).then(s => __importStar(require(s)));
        if (!mappConf)
            return undefined;
        return mappConf;
    }
    catch (e) {
        return undefined;
    }
}
async function config_type(prefix, event, type) {
    try {
        const { default: mappConf } = await Promise.resolve(`${`./${prefix}${event}-${type}.js`}`).then(s => __importStar(require(s)));
        if (!mappConf)
            return undefined;
        return mappConf;
    }
    catch (e) {
        return undefined;
    }
}
