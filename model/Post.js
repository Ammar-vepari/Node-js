const ObjectId= require('mongodb').ObjectID
const Postdb =require('../db').db()
const User=require('./User')
const sanitize =require('sanitize-html')

let Post=function(data,id,postId){
    this.data=data
    this.error=[]
    this.userId=id
    this.postId=postId
}

Post.prototype.cleanup=function(){
    if(typeof(this.data.title)!="string"){this.data.title=""}
    if(typeof(this.data.body)!="string"){this.data.body=""}

    this.data={
        title:sanitize(this.data.title,{allowedTags:[],allowedAttributes:{}}),
        body:sanitize(this.data.body,{allowedTags:[],allowedAttributes:{}}),
        CreatedDate: new Date(),
        author: ObjectId(this.userId)
    }


    
}

Post.prototype.validate=function(){

    if(this.data.title==""){this.error.push("Title cannot be EMPTY!!")}
    if(this.data.body==""){this.error.push("Body cannot be EMPTY!!")}
    
}

Post.prototype.create=function(){
    this.cleanup()
    this.validate()
    return new Promise((resolve,reject)=>{
        if(this.error.length==0){
            //console.log(this.data)
            Postdb.collection('post').insertOne(this.data).then(function(info){
                resolve(info.ops[0]._id)
            }).catch(function(){
                reject("fatal database error")
            })
            

        }
        else{
            reject(this.error)
        }


    })

}


Post.findById=function(uniqueOperation,visitorId){

    return new Promise(async function(resolve,reject){
        let aggregateItems=uniqueOperation.concat([
            {$lookup:{from:"users" ,localField:"author", foreignField:'_id', as:'authorDocument' }},
            {$project:{
            title:1,
            body:1,
            CreatedDate:1,
            authorId:"$author",
            author:{$arrayElemAt:["$authorDocument",0]}}
        }
        ])
    
    
        let post=await Postdb.collection('post').aggregate(aggregateItems).toArray()
    
        //console.log(post)
    
        post=post.map(function(x){
            x.isVisitorOwner= x.authorId.equals(visitorId)
            x.author={
                username:x.author.username,
                avatar: new User(x.author,true).avatar
            }
            return x
        })

        resolve(post)

    })

    


}


Post.viewSingle=function(id,visitorId){
     return new Promise(async function(resolve,reject){
        if(typeof(id)!="string" || !ObjectId.isValid(id)){
            reject()
            return
        }

        let post=await Post.findById([{$match:{_id: new ObjectId(id)}}],visitorId)

        if(post.length){
           //console.log(post[0])
           resolve(post[0])

        }
        else{
            reject()
        }
            
        
        
    })
}


Post.getPosts=function(authorId){
    return Post.findById([{$match:{author:authorId}},
    {$sort:{CreatedDate:-1}}])
}


Post.prototype.actuallyUpdate=function()
{
    return new Promise(async (resolve,reject)=>{
        this.cleanup()
        this.validate()
        if(this.error.length==0)
        {
            await Postdb.collection('post').findOneAndUpdate({_id: new ObjectId(this.postId)},{$set:{title:this.data.title, body:this.data.body}})
            resolve("success")
        }
        else{
            resolve("failed")
        }



    })


}


Post.prototype.update=function(){
    return new Promise(async(resolve,reject)=>{
        try{
            let post=await Post.viewSingle(this.postId,this.userId)
            if(post.isVisitorOwner){
                let result=await this.actuallyUpdate()
                resolve(result)
            }
            else{
                reject()
            }

        }catch{
            reject()
        }

    })

}


Post.delete=function(PostId,visitorId){
    return new Promise(async (resolve,reject)=>{
        try{
            let post =await Post.viewSingle(PostId,visitorId)
            if(post.isVisitorOwner){
                await Postdb.collection('post').findOneAndDelete({_id: new ObjectId(PostId)})
                resolve()
            }
            else{
                reject()
            }
        }catch{
            reject()
        }

    })


}


Post.resultOfSearched=function(searchedTerm){
    return new Promise(async(resolve,reject)=>{
        if(typeof(searchedTerm)=="string"){
            console.log("method called")
            let post=await Post.findById([
                {$match: {$text: {$search: searchedTerm}}}

            ])
            //console.log(post)
            resolve(post)
        }else{
            console.log("method failed")
            reject()
        }

    })
}

Post.findPostCount=function(id){
    return new Promise(async (resolve,reject)=>{
         let data=await Postdb.collection('post').countDocuments({author: id})
         resolve(data)


    })
}


Post.getFollowingPost=async function(id){
    let results=await Postdb.collection('follow').find({authorId: new ObjectId(id)}).toArray()
    results=results.map(function(x){
        return x.followingId
    })
    //console.log(results)
    return Post.findById([{$match: {author: {$in : results}}},
                            {$sort: {CreatedDate:-1}}])

}

module.exports=Post