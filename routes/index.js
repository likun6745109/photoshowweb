var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Image = require('../models/image.js')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs')
var path = require('path') //路径模块
	/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		"user": req.session.user
	});
});

//图片库处理
var count = 20
router.get('/photogallery', loginRequired, function(req, res) {
	// res.render('photogallery', {
	// 	"user": req.session.user
	// })
	var page = parseInt(req.query.p) || 1
	var index = (page - 1) * count
	Image.find({
		ispublic: '是'
	}, function(err, images) { //总图片
		if (err) {
			console.log(err)
		}
		var results = images.slice(index, index + count)
		req.session.imageresults = results
		res.render('photogallery', {
			"user": req.session.user,
			"images": results,
			"totalpage": Math.ceil(images.length / count),
			"page": page
		})

	})
})

//按内容搜索图片——----直接选择分类
router.get('/search/photo/class', loginRequired, function(req, res) {
		var photoclass = req.query.photoclass
		console.log(typeof(photoclass))
		var page = parseInt(req.query.p) || 1
		console.log(photoclass + " " + page)
		var index = (page - 1) * count
		Image.find({
			ispublic: '是',
			"photoclass": photoclass
		}, function(err, images) {
			console.log(images)
			if (err) {
				console.log(err)
			}
			var results = images.slice(index, index + count)
			req.session.imageresults = results
			res.render('photogallery2', {
				"user": req.session.user,
				"images": results,
				"totalpage": Math.ceil(images.length / count),
				"page": page,
				"photoclass": photoclass
			})
		})
	})
	//按内容搜索图片——输入关键字搜索
router.post('/search/photo/keyword', loginRequired, multipartMiddleware, function(req, res) {
	var keyword = req.body.searchimg
	var key1 = keyword.toString()
	console.log(typeof(key1))
	var page = parseInt(req.query.p) || 1
	var index = (page - 1) * count
	var key = new RegExp("^.*" + keyword + ".*$", "i")
	Image.find({
		photoname: key
	}, function(err, images) {
		if (err) {
			console.log(err)
		}
		var results = images.slice(index, index + count)
		req.session.imageresults = results
		res.render('photogallery3', {
			"user": req.session.user,
			"images": results,
			"totalpage": Math.ceil(images.length / count),
			"page": page,
			"keyword": key1
		})
	})
})

router.get('/search/photo/keyword', loginRequired, function(req, res) {
	var keyword = req.query.keyword
	var page = parseInt(req.query.p) || 1
	var index = (page - 1) * count
	var key = new RegExp("^.*" + keyword + ".*$", "i")
	console.log(keyword + " " + page)
	Image.find({
		photoname: key
	}, function(err, images) {
		if (err) {
			console.log(err)
		}
		var results = images.slice(index, index + count)
		req.session.imageresults = results
		res.render('photogallery3', {
			"user": req.session.user,
			"images": results,
			"totalpage": Math.ceil(images.length / count),
			"page": page,
			"keyword": keyword
		})
	})
})



//个人中心处理
router.get('/personalpage', loginRequired, function(req, res) {
		var user = req.session.user
		var keyword = req.query.keyword
		var page = parseInt(req.query.p) || 1
		var index = (page - 1) * count
		if (keyword == null) {
			console.log('null')
			Image.find({
				userid: user._id
			}, function(err, images) {
				if (err) {
					console.log(err)
				}
				var results = images.slice(index, index + count)
				req.session.imageresults = results //用于图片展示处理
				res.render('personalpage', {
					"user": req.session.user,
					"images": results,
					"totalpage": Math.ceil(images.length / count),
					"page": page,
					"keyword":keyword
				})
			})
		} else {
			if (keyword == '个人照片') {
				Image.find({
					userid: user._id,
					photoclass: keyword
				}, function(err, images) {
					if (err) {
						console.log(err)
					}
					var results = images.slice(index, index + count)
					req.session.imageresults = results //用于图片展示处理
					res.render('personalpage', {
						"user": req.session.user,
						"images": results,
						"totalpage": Math.ceil(images.length / count),
						"page": page,
						"keyword":keyword
					})
				})
			} else {
				if (keyword == '我的收藏') {
					console.log('2222')
					Image.find({
						userid: user._id
					}, function(err, images) {
						if (err) {
							console.log(err)
						}
						var results = images.slice(index, index + count)
						req.session.imageresults = results //用于图片展示处理
						res.render('personalpage', {
							"user": req.session.user,
							"images": results,
							"totalpage": Math.ceil(images.length / count),
							"page": page,
							"keyword":keyword
						})
					})
				} else {
					var key = new RegExp("^.*" + keyword + ".*$", "i")
					Image.find({
						userid: user._id,
						photoname: key
					}, function(err, images) {
						if (err) {
							console.log(err)
						}
						var results = images.slice(index, index + count)
						req.session.imageresults = results //用于图片展示处理
						res.render('personalpage', {
							"user": req.session.user,
							"images": results,
							"totalpage": Math.ceil(images.length / count),
							"page": page,
							"keyword":keyword
						})
					})
				}
			}
		}


	})
	//上传头像处理
router.post('/upload/myimg', loginRequired, multipartMiddleware, saveheadimg, function(req, res) {
		var nowuser = req.session.user
		var headimg = req.headimgaddress
		console.log(nowuser)
		User.findOne({
			_id: nowuser._id
		}, function(err, user) {
			if (err) {
				console.log(err)
			}
			user.headimg = headimg
			user.save(function(err) {
				if (err) {
					console.log(err)
				}
				req.session.user = user //更新user
				return res.redirect('/personalpage')
			})
		})
	})
	//设置昵称
router.post('/set/nickname', loginRequired, multipartMiddleware, function(req, res) {
		var nowuser = req.session.user
		var nickname = req.body.nickname
		User.findOne({
			_id: nowuser._id
		}, function(err, user) {
			if (err) {
				console.log(err)
			}
			user.nickname = nickname
			user.save(function(err) {
				if (err) {
					console.log(err)
				}
				req.session.user = user //更新user
				return res.redirect('/personalpage')
			})
		})
	})
	//修改密码处理
router.post('/modify/password', multipartMiddleware, function(req, res) { //未登录也可以改
	var username = req.body.username
	var useremail = req.body.useremail
	var newpassword = req.body.newpassword
	User.findOne({
		name: username,
		email: useremail
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		user.password = newpassword
		user.saltPassword(function(hash) {
			user.password = hash
			user.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				req.session.user = user
				return res.redirect('/')
			})
		})
	})

})

//图片展示处理
router.get('/photoshow',multipartMiddleware, function(req,res){
	var images = req.session.imageresults//用于图片展示处理
	//req.session.imageresults=''
	res.render('photoshow',{
		"images":images
	})
})
router.get('/photoshow2',multipartMiddleware, function(req,res){
	var images = req.session.imageresults//用于图片展示处理
	//req.session.imageresults=''
	res.render('photoshow2',{
		"images":images
	})
})

//登录处理
router.get('/login', function(req, res) {
	var message = req.session.message
	req.session.message =''
	res.render('login',{
		"message":message
	})
})

router.post('/user/login', multipartMiddleware, function(req, res) {

	var _username = req.body.username
	var _userpassword = req.body.password
	console.log(_username)
	User.findOne({
		name: _username
	}, function(err, user) {
		if (err) {
			console.log(err)
		}
		if (!user) {
			req.session.message = '用户名不存在！'
			return res.redirect('/login')
		} else {
			user.comparePassword(_userpassword, function(err, isMatch) {
				if (err) {
					console.log(err)
				}
				if (isMatch) {
					req.session.user = user
					return res.redirect('/')
				} else {
					req.session.message='密码错误！'
					return res.redirect('/login')
				}
			})
		}

	})
})

//退出处理
router.get('/logout', function(req, res) {
	delete req.session.user
		//app.locals.user = ''
	console.log('退出')
	return res.redirect('/')
})

//注册处理
router.get('/register', function(req, res, next) {
	var message = req.session.message
	req.session.message =''
	res.render('register', {
		"message":message
	});
});
router.post('/user/register', multipartMiddleware, function(req, res) {
	var _user = req.body.user
	console.log(_user)
	User.find({
		name: _user.name
	}, function(err, user) { //user是在users集合中找到的所以人，是一个数组
		if (err) {
			console.log(err)
		}
		if (user[0]) {
			req.session.message='该用户名已存在'
			return res.redirect('/register')
		}
		var newuser = new User(_user)
		console.log(newuser)
		newuser.saltPassword(function(hash) {
			newuser.password = hash
			newuser.save(function(err, user) {
				if (err) {
					console.log(err)
				}
				res.render('index', {
					"user": req.session.user
				});
			})
		})
	})
})

//图片上传处理
router.get('/upload/photos', loginRequired, function(req, res) {
	res.render('uploadphoto', {
		"user": req.session.user
	})
})
router.post('/upload/photos', multipartMiddleware, savePhoto, function(req, res) {
	var user = req.session.user
	var username = req.body.username
	var photoname = req.body.photoname
	var photoclass = req.body.photoclass
	var ispublic = req.body.ispublic
		//console.log(req.photoaddress[0])
	if (req.photok == 1) {
		console.log('ssssssss')
		var newimage = new Image({
			username: username,
			photoname: photoname,
			photoclass: photoclass,
			ispublic: ispublic,
			photoaddress: req.photoaddress,
			userid: user._id
		})
		newimage.save(function(err, image) {
			if (err) {
				console.log(err)
			} else {
				return res.redirect('/photogallery')
			}
		})

	} else //多个图片
	{
		console.log(req.photoaddress.length)
		for (var i = 0; i < req.photoaddress.length; i++) {
			var newimage = new Image({
				username: username,
				photoname: photoname,
				photoclass: photoclass,
				ispublic: ispublic,
				photoaddress: req.photoaddress[i],
				userid: user._id
			})
			newimage.save(function(err, image) {
				if (err) {
					console.log(err)
				}
			})
		}
		return res.redirect('/photogallery')
	}
})

//图片下载处理<%=item.photoaddress%>
router.get('/download/image/:id', function(req, res, next) {
	var id = req.params.id
	Image.findOne({
		_id: id
	}, function(err, image) {
		if (err) {
			console.log(err)
		}
		console.log(image)
		var realpath = 'public' + image.photoaddress
		var filename = image.photoaddress.split('/')[2]
		console.log(realpath + " " + filename)
		res.download(realpath, filename)
	})
})

module.exports = router;

function loginRequired(req, res, next) {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	console.log('ok')
	next();
}

function savePhoto(req, res, next) { //存图片
	var photoData = req.files.uploadimg
		//当上传的文件为一个时，就是photoDate,多个时，变为数组
	if (typeof(photoData[0]) == "undefined") //只上传了一个图片
	{
		var filepath = photoData.path
		var timestamp = Date.now()
		var type = photoData.type.split('/')[1]
		var newname = timestamp + '.' + type
		var newPath = path.join(__dirname, '../', '/public/upload/' + newname)
		var fileReadStream = fs.createReadStream(filepath)
		var fileWriteStream = fs.createWriteStream(newPath)
		fileReadStream.pipe(fileWriteStream)
		req.photoaddress = '/upload/' + newname
		req.photok = 1
		console.log(req.photoaddress)
	} else //上传多个图片
	{
		req.photoaddress = []
		req.photok = 2
		for (var i = 0; i < photoData.length; i++) {
			var filepath = photoData[i].path
			var timestamp = Date.now()
			var type = photoData[i].type.split('/')[1]
			var newname = timestamp + '.' + type
			var newPath = path.join(__dirname, '../', '/public/upload/' + newname)
			var fileReadStream = fs.createReadStream(filepath)
			var fileWriteStream = fs.createWriteStream(newPath)
			fileReadStream.pipe(fileWriteStream)
			var photoaddress = '/upload/' + newname
			req.photoaddress.push(photoaddress)
		}
		console.log(req.photoaddress[0])
	}
	next()
}

function saveheadimg(req, res, next) {
	var headimgData = req.files.myimg
	console.log(headimgData)
	var filepath = headimgData.path
	var timestamp = Date.now()
	var type = headimgData.type.split('/')[1]
	var newname = timestamp + '.' + type
	console.log(newname)
	var newPath = path.join(__dirname, '../', '/public/headimg/' + newname)
	var fileReadStream = fs.createReadStream(filepath)
	var fileWriteStream = fs.createWriteStream(newPath)
	fileReadStream.pipe(fileWriteStream)
	req.headimgaddress = '/headimg/' + newname
	next()
}