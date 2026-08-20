let url = "https://app.vwo.com?app=pramod";
console.log(url.replace(/app/g, "qa"));

// Splitting & Joining
let y ="pass,fail,skip".split(",");  // ["pass", "fail", "skip"]
let x = "hello".split("");  // ["h","e","l","l","o"]
let  z = "hello".split("");
console.log(x)
console.log(x.at(0) === x.at(-1))

// Template literal (joining with format)
let parts = ["2024", "03", "07"];
let date = parts.join("-");
console.log(date);