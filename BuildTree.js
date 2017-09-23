(function($, window) {
    $.fn.ssUserTree = function(options) {
        var defaults = {
            orgTreeUrl: "/getOrgTreeUrl",
            orgUsersUrl: "/getOrgUsersUrl",
            childrenName: "subOrgList",
            method:"post"
        };
        
        this.config = $.extend({}, defaults, options);
        
        var _this =  this,
            $this = $(this), _tree, _orgId,  _tbody, _treeData,_userData, _treeId = 'userTreeMain'

        var _render = function() {

            if(_tree && _tbody) return;
            var  template = $("<div class=\"panel-body\">"
                +"      <div class=\"panel-search\">"
                +"            <label class=\"col-sm-9 control-label\">部门信息</label>"
                +"                <div class=\"col-sm-3\">"
                +"                    <input type=\"text\" id=\"userName\" class=\"form-control\" placeholder=\"姓名/工号/姓名\">"
                +"                </div>"
                +"        </div>"
                +"        <div class=\"col-sm-12\">"
                +"            <div class=\"col-sm-4\">"
                +"                <div id="+_treeId+" class=\"ztree col-sm-12\"></div>"
                +"            </div>"
                +"            <div class=\"col-sm-8 panel-users\">"
                +"                <div class=\"row user-table-thead\">"
                +"                    <table class=\"table  table-bordered  middle-align table-striped table-condensed table-hover\">"
                +"                        <thead>"
                +"                            <tr>"
                +"                                <th>"
                +"                                    <input id=\"checkAll\" type=\"checkbox\">"
                +"                                </th>"
                +"                                <th>姓名</th>"
                +"                                <th>昵称</th>"
                +"                                <th>工号</th>"
                +"                                <th>ID</th>"
                /*+"                                <th>部门</th>"*/
                +"                            </tr>"
                +"                        </thead>"
                +"                    </table>"
                +"                </div>"
                +"                <div class=\"row user-table-tbody\">"
                +"                    <table class=\"table  table-bordered  middle-align table-striped table-condensed table-hover\">"
                +"                        <tbody></tbody>"
                +"                    </table>"
                +"                </div>"
                +"            </div>"
                +"        </div>"
                +"</div>");

            _tree = template.find("#userTreeMain");
            _tbody = template.find("tbody");
            $this.append(template);
        }


        var buildTree = function() {
            if(_treeData) return;
            var setting = {
                view : {
                    selectedMulti : false
                },
                data : {
                    key : {
                        children : _this.config.childrenName
                    }
                },
                check : {
                    enable : false
                },
                callback: {
                    //onCheck: onTreeCheck,
                    onClick: onTreeClick
                }
            };
            $.ajax({
                type: _this.config.method,
                url: _this.config.orgTreeUrl,
                success : function(datas) {
                    if(typeof datas == 'string'){
                         datas = JSON.parse(datas);
                     }
                    
                    _treeData = datas;
                    $.fn.zTree.init(_tree, setting, datas);
                    var treeObj = $.fn.zTree.getZTreeObj(_treeId);
                    treeObj.expandAll(true);
                },
                error: function() {
                    alert("获取组织机构信息失败！");
                }
            })
        }

        var onTreeCheck = function(event, treeId, treeNode) {
            
            var tree = $.fn.zTree.getZTreeObj(treeId);
            var checked = tree.getCheckedNodes(true);
            var ids = "";
            for (var i = 0; i < checked.length; i++) {
                if (i > 0) {
                    ids += ",";
                }
                ids += checked[i].id;
            }
            //var searchValue = getSearchValue();

            buildTable();
        }

        var buildTable = function(orgId, searchUser) {

            var _userName = $.trim(searchUser);
            if(orgId === _orgId && !_userName) {
                return;
            } else {
                _orgId = orgId;
                _tbody.html("");
            }


            var datas = {};
            if(checkSingId(_userName)){
                datas = {
                    'orgId' : orgId,
                    'Id' : _userName
                }
            }
            else if(checkWorkNo(_userName)){
                datas = {
                    'orgId' : orgId,
                    'workNo' : _userName
                }
            }
            else{
                datas = {
                     'orgId' : orgId,
                    'userName' : _userName
                }
            }
            $.ajax({
                type: 'POST',
                url: _this.config.orgUsersUrl,
                data: datas,
                data: JSON.stringify(datas), 
                dataType: 'json',      
                contentType: "application/json",     
                success : function(callBack) {
                    if(typeof callBack == 'string'){
                         callBack = JSON.parse(callBack);
                    }
                    _userData = callBack;
                     var _path = "/";
                     var templates = $("<tbody></tbody>");
                    
                    for(var i = 0, len = callBack.length; i <len; i++) {
                        var obj = callBack[i];
                        var template = $("<tr class=\"chooseUser\"></tr>");
                            template.append("<td><input id='"+obj['userId']+"' type=\"checkbox\"></td>");
                            template.append("<td class=\"username\"><i class=\"headerImg "+obj['userImage']+"\"></i><span>"+obj['userName']+"</span></a></td>");
                            template.append("<td>"+obj['userNameEn']+"</td>");
                            template.append("<td>"+obj['workNo']+"</td>");
                            template.append("<td>"+obj['SingId']+"</td>");
                            /*template.append("<td>"+obj['orgName']+"</td>");*/
                            templates.append(template);
                    }

                    _tbody.html(templates.html());
                },
                error: function() {
                    alert("获取人员信息失败！");
                }
            })
        }


        var onTreeClick = function(event, treeId, treeNode, clickFlag) {
            buildTable(treeNode.id);
        }

        var _init = function() {        
            _render();
            buildTree();
            checkboxEvent();

            _this.find("#userName").bind("keydown", function(e) {
                if(e.keyCode == 13) {
                    buildTable("", this.value);
                }

            })
        }


        var checkboxEvent = function() {
            var _checkAll = $this.find("#checkAll");
            
            _checkAll.click(function() {
                if(!this.checked) {
                    
                    $this.find("tbody").find("input[type='checkbox']").prop("checked", "");
                }else {
                    
                    $this.find("tbody").find("input[type='checkbox']").prop("checked", true);    
                }
            });
        }

        
        _init();
        

        this.getCheckUser = function() {
            if(!_userData) return [];
            var list = [];
            $this.find("tbody").find(":checkbox:checked").each(function() {
                for(var i = 0, len = _userData.length; i < len; i++) {
                    var _user =  _userData[i];
                    if(this.id == _user.userId) {
                        list.push(_user);
                    }
                }
            })
            return list;
        };

        return this;
    }
})(jQuery, window);

