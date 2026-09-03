// Dummy dataset of products
const catalog = [
  { id: 1, name: "Laptop", price: 999, available: true },
  { id: 2, name: "Mouse", price: 25, available: false },
  { id: 3, name: "Keyboard", price: 75, available: true },
  { id: 4, name: "Monitor", price: 250, available: true }
];

// Filter out unavailable items and extract their names
const availableProductNames = catalog
  .filter(item => item.available)
  .map(item => item.name);

console.log("Available items:", availableProductNames);
