// ============================================
// JavaScript Spread Operator (...) Examples
// ============================================

// -----------------------------------------------
// 1. Spreading Arrays
// -----------------------------------------------

const fruits = ['apple', 'banana'];
const veggies = ['carrot', 'broccoli'];

// Combining arrays
const food = [...fruits, ...veggies];
console.log('Combined arrays:', food);
// ['apple', 'banana', 'carrot', 'broccoli']

// Copying an array (shallow copy)
const original = [1, 2, 3];
const copy = [...original];
copy.push(4);
console.log('Original array:', original); // [1, 2, 3] — untouched!
console.log('Copied array:', copy);       // [1, 2, 3, 4]


// -----------------------------------------------
// 2. Spreading into Function Arguments
// -----------------------------------------------

const numbers = [5, 3, 8, 1, 9];

// Without spread ❌
console.log('Math.max without spread:', Math.max(numbers)); // NaN

// With spread ✅
console.log('Math.max with spread:', Math.max(...numbers)); // 9

// Custom function with spread
function greet(first, last, age) {
  console.log(`Hi, I'm ${first} ${last}, age ${age}`);
}

const info = ['John', 'Doe', 30];
greet(...info); // Hi, I'm John Doe, age 30


// -----------------------------------------------
// 3. Spreading Objects
// -----------------------------------------------

const user = { name: 'Alice', age: 25 };
const settings = { theme: 'dark', lang: 'en' };

// Merge objects
const profile = { ...user, ...settings };
console.log('Merged object:', profile);
// { name: 'Alice', age: 25, theme: 'dark', lang: 'en' }

// Override specific property
const updatedUser = { ...user, age: 26 };
console.log('Updated user:', updatedUser); // { name: 'Alice', age: 26 }


// -----------------------------------------------
// 4. Spreading Strings
// -----------------------------------------------

const str = 'Hello';
const chars = [...str];
console.log('String to array:', chars); // ['H', 'e', 'l', 'l', 'o']


// -----------------------------------------------
// 5. Spreading in React-style Props (Common Pattern)
// -----------------------------------------------

const defaultProps = { color: 'blue', size: 'md', disabled: false };
const customProps  = { size: 'lg', onClick: () => alert('clicked') };

// Merge with override (last key wins)
const finalProps = { ...defaultProps, ...customProps };
console.log('Final props:', finalProps);
// { color: 'blue', size: 'lg', disabled: false, onClick: [Function] }


// -----------------------------------------------
// 6. Adding Items to an Array Without Mutation
// -----------------------------------------------

const cart = ['milk', 'eggs'];
const newCart = [...cart, 'bread'];
console.log('Original cart:', cart);    // ['milk', 'eggs']
console.log('New cart:', newCart);       // ['milk', 'eggs', 'bread']


// -----------------------------------------------
// 7. Removing Duplicates Using Spread + Set
// -----------------------------------------------

const withDupes = [1, 2, 2, 3, 4, 4, 5];
const unique = [...new Set(withDupes)];
console.log('Unique values:', unique); // [1, 2, 3, 4, 5]
