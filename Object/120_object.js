const user = {
    name: "John",
    age: 30,
    email: "john@example.com"
};

console.log(user);

// Accessing properties
console.log(user.name);
console.log(user["age"]);

// Adding/modifying properties
user.city = "NYC";
user.age = 31;

console.log(user);

let config = {};
config.browser = "Chrome";
config.timeout = 3000;
config.timeout = 5000; // latest
console.log(config);
delete config.browser;
console.log(config);