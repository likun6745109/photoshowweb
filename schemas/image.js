var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var ImageSchema = new mongoose.Schema({
	username:String,
	photoname:String,
	photoclass:[String],
	ispublic:String,
	photoaddress:String,
	userid:ObjectId,
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

ImageSchema.pre('save',function(next){//重写save，方法，添加内容
	if(this.isnew)
	{
		this.meta.createAt = this.meta.updateAt = Date.now()
	}else
	{
		this.meta.updateAt = Date.now()
	}	
	next()
})

ImageSchema.methods ={
	
}

ImageSchema.statics = {
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

module.exports = ImageSchema

