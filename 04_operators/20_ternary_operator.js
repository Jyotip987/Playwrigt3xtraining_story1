let age = 20
let is_promod_will_go = age>18 ? "Yes":"No"
console.log(is_promod_will_go)

//condition ? value(if true)

let envirnoment = "staging ";
let baseUlr = envirnoment ==="prod"
?"https://api.example.com"
:"https://staging-api.exmaple.com"

console.log(baseUlr)


//template letaral

let responsetime = 850
let sla = 1000

let slaStatus = responsetime<= sla? "within SLA✅": "not with in SLA"
