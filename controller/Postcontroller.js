
const Post = require("../model/Post")

exports.access=function(req,res){
    res.render('create-post')
}

exports.create=function(req,res){
    let data=req.body
    //console.log(data)
   let post= new Post(data,req.session.users._id)
   post.create().then(function(result){
        req.flash("success","New post successfully created")
        req.session.save(()=>{res.redirect(`/post/${result}`)})

    }).catch(function(result){

        result.forEach(function(x){
            req.flash('errors',x)
        })
        req.session.save(function(){
            res.redirect('/create-post')
        })

    })


}

exports.singlePost= function(req,res){
    
            Post.viewSingle(req.params.id,req.visitorId).then(function(post){
                //console.log(post)
                res.render('post',{post: post})

            }).catch(function(){
                res.send('404')})
         
    

}


exports.viewEditScreen=function(req,res){
    Post.viewSingle(req.params.id,req.visitorId).then(function(post){
        if(post.isVisitorOwner){
            res.render('edit-post',{post:post})
        }
        else{
            req.flash('errors',"You are You are not authorized to edit this post ")
            req.session.save(function(){
                res.redirect('/')
            })
        }
        

    }).catch(function(){

        res.send("404")
    })

}

exports.editPost=function(req,res){

        let post = new Post(req.body,req.visitorId,req.params.id)
        post.update().then(function(status){
            if(status=="success")
            {
                req.flash("success","Post successfully Updated")
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })
            }
            else{
                post.error.forEach(function(x){
                    req.flash('errors',x)
                })
                req.session.save(function(){
                    res.redirect(`/post/${req.params.id}/edit`)
                })

            }

        }).catch(function(){
            req.flash('errors',"You are not authorized to edit this post")
            req.session.save(function(){
                res.redirect('/')
            })


        })
    }


exports.delete=function(req,res){
    Post.delete(req.params.id,req.visitorId).then(()=>{
        req.flash("success","Post successfully deleted")
        req.session.save(()=>{res.redirect(`/profile/${req.session.users.username}`)})
    }).catch(()=>{
        req.flash("error","You are not authorized")
        req.session.save(()=>{res.redirect('/')})
    })
}

exports.searchResult=function(req,res){

    //console.log(req.body.searchedTerm)
    Post.resultOfSearched(req.body.searchedTerm).then((data)=>{
        //console.log(data)
        res.json(data)
    }).catch(()=>{

        res.json([])
    })

}


