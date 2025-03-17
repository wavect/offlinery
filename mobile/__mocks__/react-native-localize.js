// __mocks__/react-native-localize.js
import { jest } from "@jest/globals";

module.exports = {
    getLocales: jest.fn().mockReturnValue([{ languageCode: "en" }]),
};
