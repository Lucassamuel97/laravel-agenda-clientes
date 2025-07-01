"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    caption: {
        path: '$item',
        formatting: (value) => {
            return value.caption || '';
        },
    },
    mimetype: 'mimetype',
    size: 'size',
    fileUrl: {
        path: '$item',
        formatting: (value) => {
            return value.fileUrl || '';
        },
    },
};
