// src/validationUtils.js

const Ajv = require("ajv").default;
const addFormats = require("ajv-formats");
const responseSchema = require('../responseSchema.json'); // Ensure correct path

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const extractJsonFromString = (inputString) => {
    // Simple extraction example. Adapt as necessary for your use case.
    const jsonPattern = /{[\s\S]*}/;
    const match = inputString.match(jsonPattern);
    return match ? match[0] : null;
};

const validateLlmResponse = (response) => {
    const validate = ajv.compile(responseSchema);
    const valid = validate(response);
    if (!valid) {
        console.error('Validation errors:', validate.errors);
        return false;
    }
    return true;
};

module.exports = {
    extractJsonFromString,
    validateLlmResponse,
};
