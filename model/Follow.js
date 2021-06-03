const database = require('../db').db()
const ObjectID=require('mongodb').ObjectID
const Users=require('../model/User')

let Follow =function(ProfileName,authorId){
    
    this.profileName=ProfileName
    this.authorId=authorId
    this.error=[]

}

Follow.prototype.cleanup=function(){
    if(typeof(this.profileName)!="string"){this.error.push("Invalid username")}


}

Follow.prototype.validate=function(data){
    return new Promise(async (resolve,reject)=>{
        let user=await database.collection('users').findOne({username:this.profileName})
        if(user){
            this.profileID=user._id
        }
        else{
            this.error.push("Invalid Username")
        }
        
        let result= await database.collection('follow').findOne({followingId:new ObjectID(this.profileID),authorId: new ObjectID(this.authorId)})
        console.log(result)
        if(data=="delete"){
            if(!result){this.error.push("You cannot unfollow someone whom you do not follow")}

        }
        if(data=="create"){
            if(result){this.error.push("You are already following this user")}

        }
        if(this.profileID.equals(this.authorId)){
            this.error.push("You cannot follow yourself")
        }
        resolve()
    })

}

Follow.prototype.followUser=function(){
    return new Promise(async (resolve,reject)=>{
        this.cleanup()
        try{
            await this.validate("create")
            console.log("validation successfull")
            if(this.error.length==0){
                await database.collection('follow').insertOne({followingId:new ObjectID(this.profileID),authorId: new ObjectID(this.authorId)})    
                resolve()
            }
            else{
                reject(this.error)
            }
        }catch{
            reject()
        }
    })


}


Follow.findfollowedDetails=async function(profile,user){
        let data=await database.collection('follow').findOne({followingId: ObjectID(profile), authorId: ObjectID(user)})
        if(data)
        {
            return true
        }
        else{
            return false
        }

    

}


Follow.prototype.UnfollowUser=function(){
    return new Promise(async (resolve,reject)=>{
        this.cleanup()
        try{
            await this.validate('delete')
            console.log("validation successfull")
            if(this.error.length==0){
                await database.collection('follow').deleteOne({followingId:new ObjectID(this.profileID),authorId: new ObjectID(this.authorId)})    
                resolve()
            }
            else{
                reject(this.error)
            }
        }catch{
            reject()
        }
    })




}


Follow.followers=function(profileData){
    return new Promise(async (resolve,reject)=>{
        let data=await database.collection('follow').aggregate([
            {$match:{followingId: new ObjectID(profileData)}},
            {$lookup:{from:"users", localField:"authorId", foreignField:"_id", as:"UserDocument"}},
            {$project:{
                username:{$arrayElemAt:["$UserDocument.username",0]},
                email:{$arrayElemAt:["$UserDocument.email",0]}
                }
            }
        ]).toArray()

        data=data.map((x)=>{
            let user=new Users(x,true)
            return{
                username:x.username,
                avatar:user.avatar

            }

        })
        
        resolve(data)

    })

}


Follow.following=function(profileData){
    return new Promise(async (resolve,reject)=>{
        let data=await database.collection('follow').aggregate([
            {$match:{authorId: new ObjectID(profileData)}},
            {$lookup:{from:"users", localField:"followingId", foreignField:"_id", as:"UserDocument"}},
            {$project:{
                username:{$arrayElemAt:["$UserDocument.username",0]},
                email:{$arrayElemAt:["$UserDocument.email",0]}
                }
            }
        ]).toArray()

        data=data.map((x)=>{
            let user=new Users(x,true)
            return{
                username:x.username,
                avatar:user.avatar

            }

        })
        
        resolve(data)

    })

}


Follow.findFollowerCount=function(id){
    return new Promise(async (resolve,reject)=>{
         let data=await database.collection('follow').countDocuments({followingId: id})
         resolve(data)


    })
}

Follow.findFollowingCount=function(id){
    return new Promise(async (resolve,reject)=>{
         let data=await database.collection('follow').countDocuments({authorId: id})
         resolve(data)


    })
}


module.exports=Follow