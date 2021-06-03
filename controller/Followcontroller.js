const Follow=require('../model/Follow')
const Post = require('../model/Post')

exports.follow=function(req,res){
    let follo = new Follow(req.params.username,req.visitorId)
    follo.followUser().then(()=>{
        req.flash("success","You have successfully followed the user")
        req.session.save(function(){
            res.redirect(`/profile/${req.params.username}`)
        })
    }).catch((data)=>{
        console.log("error occured")
        data.forEach((x)=>{
            req.flash('errors',x)
        })
        req.session.save(function(){
            res.redirect('/')
        })

    })


}


exports.Unfollow=function(req,res){
    let follo = new Follow(req.params.username,req.visitorId)
    follo.UnfollowUser().then(()=>{
        req.flash("success","You have successfully Un-followed the user")
        req.session.save(function(){
            res.redirect(`/profile/${req.params.username}`)
        })
    }).catch((data)=>{
        data.forEach((x)=>{
            req.flash('errors',x)
        })
        req.session.save(function(){
            res.redirect('/')
        })

    })

}