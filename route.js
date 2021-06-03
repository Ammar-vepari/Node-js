const router=require('router')

const Usercontroller=require("./controller/Usercontroller")
const Postcontroller=require('./controller/Postcontroller')
const Followcontroller=require('./controller/Followcontroller')

let route=router()

route.get('/',Usercontroller.mainPage)
route.post('/create-user',Usercontroller.register)
route.post('/login-user',Usercontroller.login)
route.post('/log-out',Usercontroller.logout)
route.get('/create-post',Usercontroller.islogin,Postcontroller.access)

route.get('/profile/:username',Usercontroller.isValidUsername,Usercontroller.sharedData,Usercontroller.viewPosts)
route.get('/profile/:username/followers',Usercontroller.isValidUsername,Usercontroller.sharedData,Usercontroller.showFollowers)
route.get('/profile/:username/following',Usercontroller.isValidUsername,Usercontroller.sharedData,Usercontroller.showFollowing)

route.post('/create-post',Postcontroller.create)
route.get('/post/:id',Postcontroller.singlePost)
route.get('/post/:id/edit',Postcontroller.viewEditScreen)
route.post('/post/:id/edit',Postcontroller.editPost)
route.post('/post/:id/delete',Postcontroller.delete)

route.post('/search',Postcontroller.searchResult)

route.post('/profile/:username/follow',Usercontroller.islogin, Followcontroller.follow)
route.post('/profile/:username/Unfollow',Usercontroller.islogin, Followcontroller.Unfollow)

module.exports=route