
import testdata from './test-data/test-data.json'


type data_1={
     id: number,
      firstName: string,
      lastName: string,
      email: string,
      age: number,
      role: string,
      isActive: boolean,
      createdAt: string,
      name:string
      category:string,
      price:number,
      stock:number,
      rating:number,
      tags:[]

}
const data = testdata.users as data_1[]
//console.log(data)
const {...obj} = data[0]
//console.log(obj)
const validuser = data.find(({id})=> id === 1)
console.log(validuser.firstName, validuser.lastName)