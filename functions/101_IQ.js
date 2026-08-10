// console.log(MAX_RETRIES); // TDZ
// const MAX_RETRIES = 3;
// // MAX_RETRIES = 4;

const score = 100
// score = score+10;

const pi = 3.14;
const prod_api_url = "https://app.vwo.com/#login";
//prod_api_url = "https://google.com"
const qa_api_url = "https://qa.vwo.com/#login";

let abc = "anil";
console.log(abc);

let g_x = 10;

function outer(){
    let x = 10;
    function inner(){
        let y = 20;
        console.log(x)
    }
    inner();
    console.log(y)
}