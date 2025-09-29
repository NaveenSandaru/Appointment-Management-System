import { encrypt, decrypt } from "../utils/crypto.js";
import { encryptedFields } from "../utils/encryptionConfig.js";

export const encryptionMiddleware = async (params, next) => {
    const model = params.model;
    const action = params.action;

    // Encrypt before saving
    if (model && encryptedFields[model]) {
        if (["create", "update", "upsert"].includes(action)) {
            const fieldsToEncrypt = encryptedFields[model];
            console.log(params.args);
            for (const field of fieldsToEncrypt) {
                if (params.args?.data?.[field]) {
                    console.log(params.args?.data?.[field]);
                    params.args.data[field] = encrypt(params.args.data[field]);
                }
            }
        }
    }

    // Call the next middleware
    const result = await next(params);

    // Decrypt after fetching
    if (model && encryptedFields[model]) {
        const fieldsToDecrypt = encryptedFields[model];

        const decryptRecord = (record) => {
            if (!record) return record;
            for (const field of fieldsToDecrypt) {
                if (record[field]) {
                    try {
                        record[field] = decrypt(record[field]);
                    } catch (e) {
                        // Ignore if it's already plaintext
                    }
                }
            }
            return record;
        };

        if (Array.isArray(result)) {
            return result.map(decryptRecord);
        } else {
            return decryptRecord(result);
        }
    }

    return result;
};
