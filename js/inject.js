function set_score(cjtype, n, v) {
    var table = document.getElementById('DataGrid1').querySelectorAll('tr');
    for (i = 1; i < table.length; i++) {
        console.log(table[i].cells[1].innerText == n);
        if (table[i].cells[1].innerText == n) {
            table[i].cells[cjtype].querySelectorAll('input')[0].value = v;
        }
    }
}


// *********自动录入成绩*******
function fileImport() {
    var a = document.getElementById('file').click();
    //获取读取我文件的File对象
    document.getElementById('file').onchange = function() {
        var selectedFile = document.getElementById('file').files[0];
        if (document.getElementById('file').files.length == 1) {
            //读取要导入 的成绩类型
            var seleced = document.getElementById('cjtype');
            var index = seleced.selectedIndex;
            if (confirm("确认要导入" + seleced.options[index].text + "?")) {
                var reader = new FileReader(); //这是核心,读取操作就是由它完成.
                reader.readAsText(selectedFile); //读取文件的内容,也可以读取文件的URL
                reader.onload = function() {
                    //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
                    // console.log(this.result);
                    var fileContent = this.result;
                    var arrLine = fileContent.split("\r\n");
                    var arrHead = arrLine[0].split(",");
                    var jsonArrayStr = ""; //值
                    var _FileData; // 学生成绩表

                    for (var i = 1; i < arrLine.length; i++) {
                        if (arrLine[i].length == 0) {
                            continue;
                        }
                        var arrItem = arrLine[i].split(",");
                        var jsonStr = ""; //json数组中的每条数据
                        if (jsonArrayStr.length > 0) {
                            jsonArrayStr += ",";
                        }
                        for (var j = 0; j < arrItem.length; j++) {
                            if (jsonStr.length > 0) {
                                jsonStr += ",";
                            }
                            jsonStr += "\"" + arrHead[j] + "\":\"" + arrItem[j] + "\"";
                        }
                        jsonArrayStr += "{" + jsonStr + "}";
                    }
                    console.log(jsonArrayStr);
                    _FileData = eval("([" + jsonArrayStr + "])");
                    console.log(_FileData) //转化成json数组 
                    for (k = 0; k < _FileData.length; k++)
                        set_score(seleced.options[index].value, _FileData[k][arrHead[0]], _FileData[k][seleced.options[index].text]);
                    // 触发保存事件
                    var e = document.createEvent("MouseEvents");
                    e.initEvent("click", true, true);
                    document.getElementById('Button1').dispatchEvent(e);
                }
            } else {
                document.getElementById('file').outerHTML = document.getElementById('file').outerHTML;
                alert("操作取消");
            }
        }
    }
}

//创建铵钮 
function createNode() {

    //创建节点 选择成绩类型
    var btn = document.createElement("select");
    //设置节点
    btn.name = "cjtype";
    btn.id = "cjtype";
    //把这个元素放到那里
    var btn_parent = document.getElementById('Button1').parentNode;
    //插入这个节点
    btn_parent.insertBefore(btn, document.getElementById('Button1').previousSibling);
    document.getElementById("cjtype").options.add(new Option("平时成绩", 3));
    document.getElementById("cjtype").options.add(new Option("期末成绩", 4));
    document.getElementById("cjtype").options.add(new Option("实验成绩", 5));

    //创建节点 选择文件
    var file = document.createElement("input");
    //设置节点
    file.type = "file";
    file.id = "file";
    file.style.display = "none";
    //把这个元素放到那里
    var file_parent = document.getElementById('Button1').parentNode;
    //插入这个节点
    file_parent.insertBefore(file, document.getElementById('Button1').previousSibling);

    //创建节点
    var btn = document.createElement("input");
    //设置节点
    btn.type = "button";
    btn.name = "cj";
    btn.id = "cj";
    btn.value = "导入成绩";
    btn.className = "button";
    //为这个节点添加点击事件
    btn.addEventListener("click", fileImport, false);
    //把这个元素放到那里
    var btn_parent = document.getElementById('Button1').parentNode;
    //插入这个节点
    btn_parent.insertBefore(btn, document.getElementById('Button1').previousSibling);
}

var node = document.evaluate('//*[@id="headDiv"]/ul/li[1]/ul/li/a', document).iterateNext()
if (node && node.text == '成绩录入')
    node.setAttribute("target", "_blank");
if (document.getElementById('Button1').value == "  保存  ")
    createNode();