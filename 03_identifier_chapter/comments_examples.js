// ==========================================
// JavaScript Comments — Comprehensive Examples
// ==========================================

// 1. SINGLE-LINE COMMENT
let age = 25 // This declares age with value 25

// 2. MULTI-LINE COMMENT (block comment)
/*
 * This function calculates the area of a rectangle.
 * It takes width and height as parameters
 * and returns the product of both.
 */
function area(width, height) {
    return width * height
}

// 3. INLINE COMMENT
let count = 0 // initialize counter to zero
count++       // increment by one
count--       // decrement by one

// 4. JSDoc COMMENT (documentation)
/**
 * Adds two numbers together.
 * @param {number} a - The first number
 * @param {number} b - The second number
 * @returns {number} The sum of a and b
 * @example
 * // returns 5
 * add(2, 3)
 */
function add(a, b) {
    return a + b
}

// 5. COMMENTING OUT CODE (disabling temporarily)
// console.log("debug: age =", age)
// let debugMode = true
// runDebugger()

// 6. BLOCK COMMENT TO DISABLE CODE
/*
let unusedVar = "not needed right now"
function oldFunction() {
    return "deprecated"
}
*/

// 7. TODO COMMENT
// TODO: Implement error handling for edge cases
// TODO: Add unit tests for the calculate function
// TODO: Refactor this section for performance

// 8. FIXME COMMENT
// FIXME: Bug occurs when input is negative
// FIXME: Memory leak in this loop
// FIXME: Race condition with async calls

// 9. HACK COMMENT
// HACK: Workaround for Safari flexbox bug v14
// HACK: Using setTimeout because the API is slow

// 10. NOTE / INFO COMMENT
// NOTE: This runs before DOM is fully loaded
// NOTE: Order of these lines matters

// 11. SECTION HEADER COMMENT
// ========== INITIALIZATION ==========
let app = {}
app.name = "MyApp"

// ========== CONFIGURATION ==========
app.config = { debug: true, env: "dev" }

// ========== MAIN LOGIC ==========
app.run = function () {
    return "running"
}

// 12. INLINE BLOCK COMMENT
let result = /* ternary inline */ age > 18 ? "adult" : "minor"
let price = 100 /* base price */ + 18 /* tax */

// 13. COMMENT BEFORE A BLOCK
// Validate user input before processing
if (age >= 18) {
    // Adult logic here
    console.log("Access granted")
} else {
    // Minor logic here
    console.log("Access denied")
}

// 14. SEPARATOR / DIVIDER COMMENT
// -----------------------------------------
// End of configuration section
// -----------------------------------------

// 15. ANNOTATION COMMENT (common in tools like ESLint)
// eslint-disable-next-line no-console
console.log("allowed console")

// eslint-disable-next-line no-unused-vars
let unused = "not flagged"

// 16. NESTED COMMENT (only single-line inside block works)
/*
 * Outer comment
 * // inner single-line comment works fine
 * // another inner line
 */

// 17. SELF-DOCUMENTING COMMENT (explaining WHY, not WHAT)
// Using bitwise OR because Math.floor is slower here
let rounded = 5.7 | 0

// Fallback to empty object if response is null
let data = apiResponse || {}

// 18. COPYRIGHT / LICENSE COMMENT
/*
 * Copyright (c) 2024 MyCompany
 * Licensed under the MIT License.
 * See LICENSE file for details.
 */
