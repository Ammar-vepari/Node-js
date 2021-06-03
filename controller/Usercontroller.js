const Users=require('../model/User')
const Post=require('../model/Post')
const Follow = require('../model/Follow')

exports.mainPage=async function(req,res){
    if(req.session.users)
    {
        let data = await Post.getFollowingPost(req.session.users._id)
        //console.log(data)
        res.render("home-login",{posts:data})
        
    }
    else{
    res.render("home-page",{Usererr:req.flash('Usererr')})
    }
}

exports.login=function(req,res){
    let user=new Users(req.body)
    user.login().then(function(result){
        req.session.users={username:user.data.username, avatar:user.avatar, _id:user.data._id}
        console.log(user.data._id)
        req.session.save(function(){
            res.redirect('/')
        })

    }).catch(function(result){

        req.flash('errors',result)
        req.session.save(function(){
            res.redirect('/')
        })
    })



}


exports.register=function(req,res)
{
    let data=req.body
    let user=new Users(data)
    user.register().then(function(){
        req.session.users={username:user.data.username, avatar:user.avatar, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch(function(err){

        err.forEach(function(x) {
            req.flash('Usererr',x)})

        req.session.save(function(){
            res.redirect('/')})

    })
}


exports.logout=function(req,res){
    req.session.destroy(function(){
        res.redirect('/')
    })

}

exports.islogin=function(req,res,next)
{
    if(req.session.users){
        next()
    }
    else{
        req.flash('errors',"Please log in first to perform this action")
        req.session.save(function(){
            res.redirect('/')
        })
    }

}

exports.isValidUsername=function(req,res,next){
    let data=req.params.username
    Users.findUsername(data).then(function(result){
        req.profileData=result
        next()
    }).catch(function(){
        res.send('404')
    })

}

exports.viewPosts=function(req,res){
    Post.getPosts(req.profileData._id).then(function(posts){
        //console.log(posts)
        res.render("profile",{
            currentPage:"posts",
            postCount:req.postCount,
            followerCount:req.followerCount,
            followingCount:req.followingCount,
            isVisitorProfile:req.isVisitorProfile,
            isFollowing:req.isFollowing,
            doc:req.profileData,post:posts})
    }).catch(function(){
        res.send("404")
    })
   
}

exports.sharedData=async function(req,res,next){
    let isFollowing=false
    let isVisitorProfile=false
    if(req.session.users){
        isVisitorProfile=req.profileData._id.equals(req.visitorId)
        isFollowing=await Follow.findfollowedDetails(req.profileData._id,req.visitorId)
    
    }
    console.log(isFollowing)
    req.isVisitorProfile=isVisitorProfile
    req.isFollowing=isFollowing
    //console.log(req.isFollowing)
    let postCountPromise=Post.findPostCount(req.profileData._id)
    let followerCountPromise=Follow.findFollowerCount(req.profileData._id)
    let followingCountPromise=Follow.findFollowingCount(req.profileData._id)
    let [postCount,followerCount,followingCount]=await Promise.all([postCountPromise,followerCountPromise,followingCountPromise])
    req.postCount=postCount
    req.followerCount=followerCount
    req.followingCount=followingCount
    next()

}

exports.showFollowers=async function(req,res){

    try{
        //console.log(req.profileData._id)
        let result=await Follow.followers(req.profileData._id)
        res.render('Post-followers',{
            postCount:req.postCount,
            followerCount:req.followerCount,
            followingCount:req.followingCount,
            currentPage:"followers",
            followers:result,
            isVisitorProfile:req.isVisitorProfile,
            isFollowing:req.isFollowing,
            doc:req.profileData
        })
    }catch{
        console.log("error Occured")
    }


}

exports.showFollowing=async function(req,res){

    try{
        //console.log(req.profileData._id)
        let result=await Follow.following(req.profileData._id)
        res.render('Post-following',{
            currentPage:"following",
            postCount:req.postCount,
            followerCount:req.followerCount,
            followingCount:req.followingCount,
            followers:result,
            isVisitorProfile:req.isVisitorProfile,
            isFollowing:req.isFollowing,
            doc:req.profileData
        })
    }catch{
        console.log("error Occured")
    }



}