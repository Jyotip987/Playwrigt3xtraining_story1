const data = require('fs').readFileSync(0, 'utf8');
// Write your solution here
console.log(`${data}*1=${data * 1}`)
console.log(`${data}*1=${data * 2}`)
console.log(`${data}*1=${data * 3}`)
console.log(`${data}*1=${data * 4}`)
console.log(`${data}*1=${data * 5}`)
console.log(`${data}*1=${data * 6}`)
console.log(`${data}*1=${data * 7}`)
console.log(`${data}*1=${data * 8}`)
console.log(`${data}*1=${data * 9}`)
console.log(`${data}*1=${data * 10}`)


const data = require('fs').readFileSync(0, 'utf8');
// Write your solution here
for (let i = 1; i <= 10; i++)
{
    let num = data* i 
console.log(`${data} * ${i} = ${num}`)
    
}
const data = require('fs').readFileSync(0, 'utf8');
// Write your solution here
for (let i = 1; i < data; i++)
{
    if (data % 5 === 0)
    {
console.log("Buzz")
    }
    else if (data % 3 === 0)
    {
        console.log("Fizz")
    }
    else {
        console.log(i)
    }
}


const data = require('fs').readFileSync(0, 'utf8');
// Write your solution here
const number = parseInt(data)
for (i = 1; i <=10; i++){
    const a = number * i 
    console.log(`${number} * ${i} = ${a}`)
}

const data = require('fs').readFileSync(0, 'utf8');
// Write your solution here
let numbers = parseInt(data)
if (numbers % 4 === 0 || (numbers % 4 === 0 && numbers % 100 !== 0)) {
    console.log("it is a leap year")
}
else
{
    console.log("it is not a leap year")
}