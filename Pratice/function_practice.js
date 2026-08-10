function maxReturn(max){
    attempt = 0
    return{ 
        tryAgain(testname){
        attempt ++
        if(attempt > max){
            return `${testname} exceed ${attempt}`
        }
        return `${attempt} & ${max} feasible`
    },
     tryAgain_2(apitestname){
        attempt ++
        if(attempt > max){
            return `APi{testname} exceed ${attempt}`
        }
        return `API ${attempt} & ${max} feasible`

    
    }
    }

}

let trying = maxReturn(4)
console.log(trying.tryAgain_2("loginAPI"))
console.log(trying.tryAgain_2("loginAPI"))
console.log(trying.tryAgain_2("loginAPI"))
console.log(trying.tryAgain_2("loginAPI"))
console.log(trying.tryAgain_2("loginAPI"))