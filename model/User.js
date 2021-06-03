const validator=require('validator')
const bcrypt=require('bcryptjs')
const database=require('../db').db()
const md5=require('md5')

let User=function(data,avt){
    this.data=data
    this.errors=[]
    if(avt== undefined){avt= false}
    if(avt){this.getAvatar()}
}


User.prototype.cleanup=function()
{
    if(typeof(this.data.username)!="string"){this.data.username=""}
    if(typeof(this.data.email)!="string"){this.data.email=""}
    if(typeof(this.data.password)!="string"){this.data.password=""}


    this.data={
        username:this.data.username,
        email:this.data.email,
        password:this.data.password
    }
}

User.prototype.validate= function()
{
    return new Promise(async (resolve,reject)=>{

        if(this.data.username == ""){this.errors.push('username field is empty')}
    if(!validator.isAlphanumeric(this.data.username)){this.errors.push("invalid username")}
    if(!validator.isEmail(this.data.email)){this.errors.push('invalid email')}
    if(this.data.password == ""){this.errors.push('password field is empty')}
    if(this.data.password.length>0 && this.data.password.length<10){this.errors.push('enter a strong password with at least 10 values')}
    if(this.data.password.length>30){this.errors.push('enter the password in range  of 10 to 30 characters')}
    if(this.data.username.length>15){this.errors.push('enter the username in range of 15 character')}
    if(this.data.username.length>0 && this.data.username.length<3){this.errors.push('username can not be less then 3 characters')}
    
    if(this.data.username.length>3 && this.data.username.length<15 && validator.isAlphanumeric(this.data.username)){
        let usernamedb= await database.collection('users').findOne({username: this.data.username})
        if(usernamedb)
        {
            this.errors.push("the Username you are trying to use is already taken")
        }
    }

    if(validator.isEmail(this.data.email)){
        let useremaildb= await database.collection('users').findOne({email: this.data.email})
        if(useremaildb)
        {
            this.errors.push("the email you are trying to use is in use")
        }
    }
    resolve()

    })

    
    


}

User.prototype.login=function(){
     this.cleanup()
     return new Promise((resolve,reject)=>{
        database.collection('users').findOne({username:this.data.username}).then((fetchedData)=>{
            if(fetchedData && bcrypt.compareSync(this.data.password,fetchedData.password)){
                this.data=fetchedData
                this.getAvatar()
                console.log(this.avatar)
                resolve("success")
               }
               else{
                   reject("invalid user id and password")
               }
   
        }).catch(function(){
            reject("fatal database error occured")
   
        })



     })





}

User.prototype.register=function(){

    return new Promise(async (resolve,reject)=>{

        this.cleanup()
        await this.validate()
        if(this.errors.length==0){
            let salt=bcrypt.genSaltSync()
            this.data.password=bcrypt.hashSync(this.data.password,salt)
            await database.collection('users').insertOne(this.data)
            let user_Id= await database.collection('users').findOne({username:this.data.username})
            this.data=user_Id
            this.getAvatar()
            //console.log(this.data)
            resolve()
        }
        else{
            reject(this.errors)
        }


    })
    
    

}



User.prototype.getAvatar=function(){


    this.avatar=`https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}



User.findUsername=function(name){

    return new Promise(function(resolve,reject){
        console.log(name)
        if(typeof(name)!="string"){
            reject()
            return
        }

        database.collection('users').findOne({username:name}).then(function(userdoc){
            if(userdoc){

                userdoc=new User(userdoc,true)
                userdoc={
                    _id: userdoc.data._id,
                    username: userdoc.data.username,
                    avatar: userdoc.avatar
                }
                resolve(userdoc)

            }
            else{
                reject()
            }

        }).catch(function(){
            reject()
        })

    })
}


module.exports=User