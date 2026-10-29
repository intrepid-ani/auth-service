import { describe, expect, it } from "@jest/globals";

function isWholeNumber(a: number) {
    return String(a).trim() != "" && Number.isInteger(a) && a >= 0;
}

describe("check isWholeNumber()", () => {
    it("with input 0 return true", () => {
        expect(isWholeNumber(0)).toBe(true);
    });
    it("with input 1 return true", () => {
        expect(isWholeNumber(1)).toBe(true);
    });
    it("with input -1 return false", () => {
        expect(isWholeNumber(-1)).toBe(false);
    });
    it("with input 5 return false", () => {
        expect(isWholeNumber(5)).toBe(true);
    });
});
