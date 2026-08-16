


 // Define an object that showcases many different value types
const mixedData = {
  // Primitive values
  id: 42,                     // number
  title: "Demo Object",       // string
  isActive: true,            // boolean


  // Array containing various types
  items: [
    1,
    "two",
    false,
    { name: "inner", value: 3 },
    () => console.log("Item function")
  ],

  // Method defined using the classic function syntax
  greet() {
    console.log(`Hello from ${this.title}!`);
  },

  // Arrow‑function property
  compute: (a, b) => a * b,

  // Function stored inside the array (demonstrating function values in collections)
  runFirstItem() {
    const first = this.items[0];
    console.log("First item:", first);
  }
};

// Using the object
mixedData.greet();                     // → Hello from Demo Object!
console.log(mixedData.compute(5, 7)); // → 35
mixedData.runFirstItem();             // → First item: 1

// Accessing nested object literal
console.log(mixedData.meta.created.toISOString());

// Invoking a function that lives inside the array
mixedData.items[4](); // → Item function