var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs');
var timelong=10;
var UserSchema = new mongoose.Schema({
	name:{
		unique:true,
		type:String
	},
	password:String,
	email:String,
	phone:String,
	headimg:{
		type:String,
		default:'/headimg/head.jpg'
	},
	nickname:{
		type:String,
		default:''
	},
	//0:普通用户 1:什么高级用户之类
	role:
	{
		type:Number,
		default:0
	},//角色，设置用户权限
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
})

UserSchema.pre('save',function(next){//重写save，方法，添加内容
	if(this.isnew)
	{
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else
	{
		this.meta.updateAt = Date.now()
	}	
	next()
})

UserSchema.methods ={
	comparePassword: function(_password,cb)
	{
		//console.log(_password)
		bcrypt.compare(_password,this.password,function(err,isMacth){
			if(err)
			{
				return cb(err)
			}
			console.log(isMacth)
			cb(null,isMacth)
		})
	},
	saltPassword:function(cb)
	{
	  var user = this;
	  bcrypt.genSalt(timelong,function(err,salt){
		  if(err) return next(err)
		  console.log(salt)
		  bcrypt.hash(user.password,salt,null,function(err,hash){
			  if(err) return next(err)
			 // this.password =hash;
			 // console.log(this.password)
			  //this.password = hash;
			  cb(hash)
		  })
	  })
	}
}

UserSchema.statics = {
	fetch:function(cb){
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb)
	},
	findById:function(id,cb){
		return this
			.findOne({_id:id})
			.exec(cb)
	}
}

module.exports = UserSchema

