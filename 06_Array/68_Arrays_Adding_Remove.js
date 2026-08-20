let arr = [1, 2, 3];
console.log(arr);

// Add to END
arr.push(4);
console.log(arr);

// Remove from END
arr.pop();
console.log(arr);

arr.push(5, 6);
console.log(arr);

// Add to BEGINNING
arr.unshift(0);
console.log(arr);

// Remove from BEGINNING
arr.shift();
console.log(arr);

// [ 1, 2, 3, 5, 6,7,8,9,10 ]
const arry = [ 1, 2, 3,4, 5, 6,7,8,9,10]
console.log("-----------")
arry.splice(2, 0,199,1900);
console.log(arry);

arry.splice(3, 0, 99,900);
console.log(arry);

arry.splice(1, 2, 10, 20);
console.log(arry);