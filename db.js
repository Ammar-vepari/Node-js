const dotenv=require('dotenv')
const mongodb= require('mongodb')
dotenv.config()
 mongodb.connect(process.env.CONNECTIONSTRING,{useNewUrlparser: true},function(err,client){
     module.exports=client
     let App=require('./app')
     App.listen(process.env.PORT)


 })
