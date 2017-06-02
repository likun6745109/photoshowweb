$("#inputuploadmyimg").click(function(){
	if($.trim($("#uploadimage").val())==''){
		alert("不能为空")
		return false
	}
	return true
})