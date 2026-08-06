// Data Type in the JS

// string, number, boolean, bigInt, undefined, null, Symbol
// array, NaN




let year = parseInt(data)
if (year % 400 === 0) {
    console.log(`${year} is a leap year`)
}
else if ((year % 400 === 0&& year % 100 === 0)) {
    console.log(`${year} is not a leap year`)
}
else if (year % 4 === 0 && year % 100 !== 0) {
    console.log(`${year} is a leap year`)
}
else {
    console.log(`${year}  is not a leap year`);
}
