function * generateUniqueID(){
    let id = 0
    while(true){
        yield id
        id++
    }
}
const getId = generateUniqueID()
console.log(getId.next())
console.log(getId.next())
console.log(getId.next())
console.log(getId.next())