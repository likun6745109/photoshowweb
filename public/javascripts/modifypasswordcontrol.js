$("#inputmodifypassword").click(function(){
	if($.trim($("#username").val())=='' || $.trim($("#useremail").val())=='' || $.trim($("#newpassword").val())==''){
		alert("不能为空")
		return false
	}
	return true
})