const express= require('express')
const session=require('express-session')
const  MongoStore=require('connect-mongo')(session)
const flash=require('connect-flash')
const markeDown=require('marked')
const sanitize=require('sanitize-html')
const App= express()



let SessionData=session({
    secret: 'keyboard cat',
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge:1000*60*60*24 , httpOnly: true }

})

App.use(SessionData)
App.use(flash())

App.use(function(req,res,next){
    res.locals.styledDocument=function(content){
        return sanitize(markeDown(content),{allowedTags:['Bold','i','p','br','strong','em','h1','h2','h3','h4','h5','p','li','ul','ol'],allowedAttributes:{}})
    }

    res.locals.error=req.flash('errors')
    res.locals.success=req.flash('success')

    if(req.session.users){
        req.visitorId=req.session.users._id
    }
    else{
        req.visitorId=0
    }
    res.locals.user=req.session.users
    next()
})
const route=require('./route')


App.use(express.urlencoded({extended:false}))
App.use(express.json())

App.use(express.static('public'))
App.set('views','views')
App.set('view engine','ejs')

App.use('/',route)


const server=require('http').createServer(App)
const io=require('socket.io')(server)

io.use(function(socket,next){
    SessionData(socket.request,socket.request.res,next)
})

io.on('connection',(socket)=>{

    if(socket.request.session.users){
        let user=socket.request.session.users
        socket.emit('welcome',{username:user.username,avatar:user.avatar})
        socket.on('MessagefromBrowser',(data)=>{
            socket.broadcast.emit('MessagefromServer',{chat:data.message,username:user.username,avatar:user.avatar})
        })
    }

    //console.log("a user has connected")
})

module.exports=server