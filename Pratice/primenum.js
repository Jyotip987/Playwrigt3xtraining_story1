const data = require('fs').readFileSync(0, 'utf8');
const num = parseInt(data.trim(), 10);
// Write your solution here
if (num <= 1) {
    console.log("not a prime numer or a special number")
}

let i = 2

while( i< num)  {
        if (num % i === 0) {
           isPrime = false
                break
        }
    
    i++
}
if (isPrime === false) {
    console.log("not a prime")
}
else {
    console.log(" a prime")
}
    