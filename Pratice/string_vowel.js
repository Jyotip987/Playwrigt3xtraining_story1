let str_name = "I am a shopkeeper"
let countVowel = 0
let countConsonant = 0

for(let i = 0; i<str_name.length;i++){
    if(str_name[i] === "a" || str_name[i] === "e" || str_name[i] === "i"|| str_name[i] === "o"|| str_name[i] === "u"){
    countVowel +=1
    }
    else{
        countConsonant +=1
    }
    
}
console.log(`Count of Vowel is ${countVowel} and Count of consonant is ${countConsonant}`)
