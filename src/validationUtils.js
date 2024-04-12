// src/validationUtils.js

const Ajv = require("ajv").default;
const addFormats = require("ajv-formats");
const responseSchema = require('../config/responseSchema.json'); // Ensure correct path

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const extractJsonFromString = (inputString) => {
    const jsonPattern = /{[\s\S]*}/; // Pattern to match JSON structure
    const match = inputString.match(jsonPattern); // Attempt to find JSON structure in string
    if (match) {
        try {
            return JSON.parse(match[0]); // Parse matched JSON string into an object
        } catch (error) {
            console.error('Error parsing JSON from string:', error);
            return null; // Return null or handle error as appropriate
        }
    } else {
        return null; // No JSON-like structure found in inputString
    }
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
