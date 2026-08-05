const data = require('fs').readFileSync(0, 'utf8');
const n = parseInt(data.trim(), 10);
// Write your solution here

// Write your solution here
for (let i = 1; i <= n; i++){
    let space = ""
    let row= ""
    for (let j = n; j > i; j--){
        space = space + " "
        
    }
   
    for (let k = 1; k < (2*i); k++){
        row= row+"*"
    }
    console.log(space+row)

}