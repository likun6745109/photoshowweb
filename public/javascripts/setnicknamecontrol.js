$("#inputnickname").click(function(){
	if($.trim($("#mynickname").val())==''){
		alert("不能为空")
		return false
	}
	return true
})