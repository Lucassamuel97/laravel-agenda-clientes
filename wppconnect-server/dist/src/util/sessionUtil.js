"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventEmitter = exports.sessions = exports.clientsArray = exports.chromiumArgs = void 0;
exports.deleteSessionOnArray = deleteSessionOnArray;
const events_1 = require("events");
exports.chromiumArgs = [
    '--disable-web-security', // Disables web security
    '--no-sandbox', // Disables sandbox
    '--aggressive-cache-discard', // Aggressively discards cache
    '--disable-cache', // Disables cache
    '--disable-application-cache', // Disables application cache
    '--disable-offline-load-stale-cache', // Disables loading stale offline cache
    '--disk-cache-size=0', // Sets disk cache size to 0
    '--disable-background-networking', // Disables background networking activities
    '--disable-default-apps', // Disables default apps
    '--disable-extensions', // Disables extensions
    '--disable-sync', // Disables synchronization
    '--disable-translate', // Disables translation
    '--hide-scrollbars', // Hides scrollbars
    '--metrics-recording-only', // Records metrics only
    '--mute-audio', // Mutes audio
    '--no-first-run', // Skips first run
    '--safebrowsing-disable-auto-update', // Disables Safe Browsing auto-update
    '--ignore-certificate-errors', // Ignores certificate errors
    '--ignore-ssl-errors', // Ignores SSL errors
    '--ignore-certificate-errors-spki-list', // Ignores certificate errors in SPKI list
];
// eslint-disable-next-line prefer-const
exports.clientsArray = [];
exports.sessions = [];
exports.eventEmitter = new events_1.EventEmitter();
function deleteSessionOnArray(session) {
    const newArray = exports.clientsArray;
    delete exports.clientsArray[session];
    exports.clientsArray = newArray;
}
