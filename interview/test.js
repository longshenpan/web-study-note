EIAP.NodeConfigBase = EIAP.extend(EIAP.CustomUI, {
    title: null,
    nodeType: "",
    nodeCmpId: null,
    initComponent: function () {
        var g = this;
        this.nodeWindow = EIAP.Window({
            width: 600,
            height: 460,
            title: this.title,
            buttons: this.getButtons(),
            afterClose: function () {
                g.afterWinClose();
            },
            items: [{
                xtype: "TabPanel",
                id: "nodeWinTabPanel",
                isOverFlow: false,
                defaultConfig: {
                    iframe: false,
                    closable: false
                },
                onActive: function (index) {
                    g.doTabItemActive(index);
                },
                items: this.getWinTabItmes()
            }]
        });
    },
    afterWinClose: function () {
        EIAP.remove("box_PositionMark");
        EIAP.remove("box_PositionCategoryMark");
        EIAP.remove("box_StarterIsExecutorMark");
        EIAP.remove("box_PartnerMemberIsExecutorMark");
        EIAP.remove("box_ArbitrarilyExecutorMark");
    },
    doTabItemActive: function (index) {
        var g = this;
        if (index === 2) {
            if (!EIAP.getCmp("box_PositionMark")) {
                EIAP.PositionMarkBox({ renderTo: "box_PositionMark" });
                EIAP.getCmp("box_PositionMark").show();
            }
        }
    },
    doSaveForWinButton: function () {
        var g = this;
        var nodeData = g.getNodeData();
        if (nodeData === false) {
            return;
        }
        //删除当前结点开始的线
        var oldLines = g.mainCmp.instance.getConnections({ source: g.nodeCmpId });
        for (var i = 0; i < oldLines.length; i++) {
            var oldLine = oldLines[i];
            g.mainCmp.instance.detach(oldLine);
        }
        //重新处理连线
        //默认下一步
        if (nodeData.NextNodeCmpId != "") {
            g.mainCmp.connectNode(g.nodeCmpId, nodeData.NextNodeCmpId);
        }
        //条件实体下一步
        if (nodeData.ExpressionNodes) {
            for (var i = 0; i < nodeData.ExpressionNodes.length; i++) {
                g.mainCmp.connectNode(g.nodeCmpId, nodeData.ExpressionNodes[i].NextNodeCmpId, "DottedLine");
            }
        }
        g.mainCmp.nodeDatas[g.nodeCmpId] = nodeData;
        //更新节点名称
        $("#" + g.nodeCmpId).find(".node-title").text(nodeData.Name);
        g.nodeWindow.close();
    },
    getButtons: function () {
        var g = this;
        var bar = [
           {
               title: SEI.lang("保存配置"),
               width: 50,
               iconCls: "icon-common-save",
               handler: function () {
                   g.doSaveForWinButton();
               }
           }, {
               title: SEI.lang("取消"),
               width: 40,
               iconCls: "icon-common-cross",
               handler: function () {
                   g.nodeWindow.close();
               }
           }];
        return bar;
    },
    getWinTabItmes: function () {
        return [
                    this.getNormalTab(),
                    this.getOperateTab(),
                    this.getExcutorTab(),
                    this.getNotifyTab()
        ];
    },
    getNormalTab: function (nodeType) {
        var g = this;
        return {
            title: SEI.lang("常规配置"),
            xtype: "FormPanel",
            id: "nodeWin_Normal",
            padding: 10,
            width: 600,
            defaultStyle: {
                labelWidth: 110,
                allowBlank: false
            },
            defaultType: "TextField",
            items: g.getNormalTabItems(g.nodeType)
        };
    },
    getCanSelectNodes: function () {
        var g = this;
        var allNodes = g.mainCmp.getAllNodes();
        var result = EIAP.util.Array.filter(allNodes, function (item) {
            if (item.Id == g.nodeCmpId || item.Type == "StartNode") {
                return false;
            }
            return true;
        });
        return result;
    },
    getNormalTabItems: function (nodeType) {
        var g = this;
        return [{ name: "Id", hidden: true },
        {
            title: SEI.lang("节点名称"),
            name: "Name"
        }, {
            title: SEI.lang("节点说明"),
            name: "Remark",
            allowBlank: true
        }, {
            title: SEI.lang("工作任务"),
            name: "TaskName"
        }, {
            title: SEI.lang("额定工时(分钟)"),
            xtype: "NumberField",
            precision: 0,
            name: "RatedWorkTime",
            displayText: SEI.lang("请输入整数")
        }, {
            xtype: "ComboBox",
            title: SEI.lang("默认下一步节点"),
            name: "NextNodeName",
            canClear: false,
            field: ["NextNodeCmpId", "NextNodeType"],
            data: g.getCanSelectNodes(),
            allowBlank: true,
            reader: {
                name: "Name",
                field: ["Id", "Type"]
            }
        }, {
            xtype: "ComboBox",
            title: SEI.lang("任务执行页面"),
            name: "ResumeActionName",
            canClear: false,
            field: ["ResumeActionId", "ResumeActionCode"],
            store: { url: "../GetResumeActions/", params: { flowTypeId: g.mainCmp.businessFlowData.BusinessFlowTypeId, nodeType: g.nodeType } },
            reader: {
                name: "Name",
                field: ["Id", "Code"]
            },
        }, {
            title: SEI.lang("执行工作备注"),
            name: "DefaultResumeNote",
            allowBlank: true
        }, {
            xtype: "ComboBox",
            title: SEI.lang("检查执行人权限"),
            name: "NeedAuthCheckName",
            canClear: false,
            field: ["NeedAuthCheck"],
            store: { url: "../GetAuthCheckSign/" },
            reader: {
                name: "Name",
                field: ["Code"]
            },
        }];
    },
    getOperateTab: function () {
        var g = this;
        return {
            title: SEI.lang("操作配置"),
            xtype: "FormPanel",
            id: "nodeWin_Operate",
            async: false,
            padding: 10,
            width: 600,
            defaultStyle: {
                labelWidth: 120
            },
            defaultType: "TextField",
            items: g.getOperateTabItems(this)
        };
    },
    getOperateTabItems: function () {
        var g = this;
        var initBar = function () {
            return [{
                title: SEI.lang("新增"),
                iconCls: "icon-common-add",
                handler: function () {
                    var operateAddGrid = new EIAP.ControlConditionConfig({
                        cmpId: "setConditionGrid",
                        isStartControl: false,
                        flowTypeId: g.mainCmp.businessFlowData.BusinessFlowTypeId,
                        isEdit: false,
                        orderCmp: g
                    });
                }
            },
            {
                title: SEI.lang("编辑"),
                iconCls: "icon-common-edit",
                handler: function () {
                    var operateEditGrid = new EIAP.ControlConditionConfig({
                        cmpId: "setConditionGrid",
                        isStartControl: false,
                        flowTypeId: g.mainCmp.businessFlowData.BusinessFlowTypeId,
                        isEdit: true,
                        orderCmp: g
                    });
                }
            },
            {
                title: SEI.lang("删除"),
                iconCls: "icon-common-delete",
                handler: function () {
                    var grid = EIAP.getCmp("setConditionGrid");
                    var rowId = grid.getSelectRow();
                    if (rowId.length == 0) {
                        EIAP.Msg.alert("操作提示", "请选择需要删除的行项目！");
                    } else {
                        EIAP.Msg.confirm("删除警告", "您确定要删除选择的行项目吗?", function (btn) {
                            if (btn == "yes") {
                                var id = grid.grid.jqGrid('getGridParam', 'selrow');
                                grid.grid.jqGrid('delRowData', id);
                            }
                        });
                    }
                }
            }];
        };
        return [{
            xtype: "CheckBox",
            name: "CanTerminate",
            title: SEI.lang("允许流程发起人终止"),
            cellWidth: 150
        }, {
            xtype: "CheckBox",
            name: "CanRevokeByPreviousNode",
            title: SEI.lang("能否被上一步撤回"),
            cellWidth: 400
        }, {
            xtype: "CheckBox",
            name: "CanEditEntity",
            title: SEI.lang("允许修改业务实体"),
            cellWidth: 150
        }, {
            xtype: "CheckBox",
            name: "CanAutoExecut",
            title: SEI.lang("允许自动执行"),
            cellWidth: 400
        }, {
            xtype: "CheckBox",
            name: "CanSuspend",
            title: SEI.lang("允许挂起流程"),
            cellWidth: 150,
            onChecked: function (v) {
                var parentId = this.parentCmp;
                var formCmp = EIAP.getCmp(parentId);
                var relation = formCmp.getCmpByName("SuspendNote");
                if (!v) {
                    relation.reset();
                }
                relation.setReadOnly(!v);
                relation.allowBlank = !v;
                relation.dom.field.blur();
            }
        }, {
            title: SEI.lang("挂起流程备注"),
            readonly: true,
            name: "SuspendNote",
            width: 250,
            cellWidth: 400
        }, {
            xtype: "CheckBox",
            name: "IsUseWorkPage",
            title: SEI.lang("是否使用工作页面"),
            cellWidth: 150,
            onChecked: function (v) {
                var parentId = this.parentCmp;
                var formCmp = EIAP.getCmp(parentId);
                var relation = formCmp.getCmpByName("WorkPageName");
                if (!v) {
                    relation.reset();
                }
                relation.setReadOnly(!v);
                relation.allowBlank = !v;
                relation.dom.field.blur();
            }
        }, {
            xtype: "ComboBox",
            title: SEI.lang("工作页面"),
            name: "WorkPageName",
            readonly: true,
            width: 250,
            cellWidth: 400,
            canClear: false,
            field: ["WorkPageUrl", "WorkPageId"],
            store: { url: "../GetWorkPages/", params: { entityTypeId: g.mainCmp.businessFlowData.BusinessEntityTypeId } },
            reader: {
                name: "Name",
                field: ["PageURL", "Id"]
            },
        }, {
            xtype: "CheckBox",
            name: "IsInvoke",
            title: SEI.lang("是否调用服务方法"),
            cellWidth: 150,
            onChecked: function (v) {
                var parentId = this.parentCmp;
                var formCmp = EIAP.getCmp(parentId);
                var relation = formCmp.getCmpByName("MethodDisplayName");
                if (!v) {
                    relation.reset();
                }
                relation.setReadOnly(!v);
                relation.allowBlank = !v;
                relation.dom.field.blur();
            }
        }, {
            xtype: "ComboBox",
            title: SEI.lang("调用的服务方法"),
            name: "MethodDisplayName",
            readonly: true,
            width: 250,
            cellWidth: 400,
            canClear: false,
            field: ["MethodName"],
            store: { url: "../GetWorkFlowInvokeMethod/", params: { contractName: g.mainCmp.businessFlowData.BusinessEntityTypeContract } },
            reader: {
                name: "MethodDisplayName",
                field: ["MethodName"]
            },
        }, {
            xtype: "GridPanel",
            renderTo: this.renderTo,
            title: SEI.lang("条件控制"),
            width: 585,
            height: 285,
            tbar: initBar(),
            showSearch: false,
            id: 'setConditionGrid',
            gridCfg: {
                loadonce: true,
                colModel: [
                    { name: 'Id', hidden: true },
                    //{ name: 'GridSerialNumber', index: 'GridSerialNumber', label: SEI.lang("序号"), width: 80 },
                    { name: 'Expression', index: 'Expression', label: SEI.lang("条件表达式"), width: 320 },
                    { name: 'NextNodeName', index: 'NextNodeName', label: SEI.lang("下一步节点"), width: 180 },
                    //{ name: 'PositionCode', index: 'PositionCode', label: SEI.lang("操作"), width: 80 },
                    { name: 'NextNodeCmpId', hidden: true },
                    { name: 'NextNodeType', index: 'NextNodeType', hidden: true }
                ],
                rowNum: 20,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Expression'
                //jsonReader: { id: "Id" },
                //localReader: { Id: "Id" }
            }
        }];
    },
    getExcutorTab: function () {
        var g = this;
        return {
            title: SEI.lang("执行人配置"),
            xtype: "FormPanel",
            id: "nodeWin_Excutor",
            async: false,
            width: 600,
            defaultStyle: {
                labelWidth: 110
            },
            defaultType: "TextField",
            items: g.getExcutorTabItems()
        };
    },
    getExcutorTabItems: function () {
        var g = this;
        return [{
            xtype: "RadioBoxGroup",
            readonly: false,
            name: "ExecutorChooseGroup",
            id: 'ExecutorChooseGroup',
            width: 230,
            onChecked: function (v) {
                $(".tab_orderpart").hide();
                if (v === "StarterIsExecutorMark") {
                    var tip = '<div class="e-order-msg"><div class="icon icon-tip icon-common-warning"></div><div class="icon-text tips"><span style=" font-weight: bold;font-size:14px;">' + SEI.lang("温馨提示:") + '</span>' + SEI.lang("该节点将由流程发起人执行") + '</div></div>';
                    $("#executorchooseboxcontent").append("<div id='box_" + v + "' class='tab_orderpart'>" + tip + "</div>");
                    $("#box_" + v).show();
                    return;
                }
                if (v === "ArbitrarilyExecutorMark") {
                    var tip = '<div class="e-order-msg"><div class="icon icon-tip icon-common-warning"></div><div class="icon-text tips"><span style=" font-weight: bold;font-size:14px;">' + SEI.lang("温馨提示:") + '</span>' + SEI.lang("该节点可任意指定执行人执行") + '</div></div>';
                    $("#executorchooseboxcontent").append("<div id='box_" + v + "' class='tab_orderpart'>" + tip + "</div>");
                    $("#box_" + v).show();
                    return;
                }
                var box = EIAP.getCmp("box_" + v);
                if (box) {
                    box.show();
                } else {
                    $("#executorchooseboxcontent").append("<div id='box_" + v + "' class='tab_orderpart'></div>");
                    var xtype = v + "Box";
                    var cmp = eval("EIAP." + xtype);
                    if (!cmp) {
                        throw new Error(String.format(EIAP.error.noCmp, xtype));
                    } else {
                        cmp = cmp.call(cmp, { renderTo: "box_" + v, orderCmp: g });
                    }
                    $("#box_" + v).show();
                }
            },
            items: [{
                title: "<span style='color:#007900;font-weight:bold;'>" + SEI.lang("岗位") + "</span>",
                labelWidth: 80,
                name: "ExecutorChoose",
                inputValue: "PositionMark",
                checked: true
            }, {
                title: "<span style='color:#007900;font-weight:bold;'>" + SEI.lang("岗位类别") + "</span>",
                name: "ExecutorChoose",
                inputValue: "PositionCategoryMark",
                labelWidth: 80
            }, {
                title: "<span style='color:#007900;font-weight:bold;'>" + SEI.lang("流程发起人") + "</span>",
                name: "ExecutorChoose",
                inputValue: "StarterIsExecutorMark",
                labelWidth: 80
            }, {
                title: "<span style='color:#007900;font-weight:bold;'>" + SEI.lang("自定义执行人") + "</span>",
                name: "ExecutorChoose",
                inputValue: "PartnerMemberIsExecutorMark",
                labelWidth: 80
            }, {
                title: "<span style='color:#007900;font-weight:bold;'>" + SEI.lang("任意指定") + "</span>",
                name: "ExecutorChoose",
                inputValue: "ArbitrarilyExecutorMark",
                labelWidth: 80
            }]
        }, {
            xtype: "Panel",
            id: "executorchoosebox",
            height: 0,
            padding: 0,
            html: "<div id='executorchooseboxcontent'><div id='box_PositionMark' class='tab_orderpart'></div></div>"
        }];
    },
    getNotifyTab: function () {
        var g = this;
        return {
            title: SEI.lang("通知配置"),
            xtype: "Panel",
            id: "nodeWin_Notify",
            async: false,
            width: 600,
            defaultStyle: {
                height: 140,
                width: 575
            },
            defaultType: "TextField",
            items: g.getNotifyTabItems()
        };
    },
    getNotifyTabItems: function () {
        var g = this;
        var initBar = function () {
            var g = this;
            return [{
                title: SEI.lang("新增"),
                iconCls: "icon-common-add",
                handler: function () {
                    var positionSelect = new EIAP.PositionSelect({
                        cmpId: "NoticePsoitionGrid"
                    });
                }
            }, {
                title: SEI.lang("删除"),
                iconCls: "icon-common-delete",
                handler: function () {
                    var grid = EIAP.getCmp("NoticePsoitionGrid");
                    var rowId = grid.getSelectRow();
                    if (rowId.length == 0) {
                        EIAP.Msg.alert("操作提示", "请选择需要删除的行项目！");
                    } else {
                        EIAP.Msg.confirm("删除警告", "您确定要删除选择的行项目吗?", function (btn) {
                            if (btn == "yes") {
                                var id = grid.grid.jqGrid('getGridParam', 'selrow');
                                grid.grid.jqGrid('delRowData', id);
                            }
                        });
                    }
                }
            }];
        };
        if (!g.mainCmp.isLoadNotifiWay) {
            EIAP.Store({
                url: "../GetAllNotifyWays/",
                async: false,
                cache: false,
                success: function (data) {
                    g.mainCmp.notifyWays = data;
                    g.mainCmp.isLoadNotifiWay = true;
                },
                failure: function (re) {
                    myMask.hide();
                    var status = { StatusSign: 2, Message: re.responseText };
                    EIAP.ProcessStatus({ status: status });
                }
            });
        }
        var items = [];
        for (i = 0; i < g.mainCmp.notifyWays.length; i++) {
            var type = g.mainCmp.notifyWays[i];
            var typedom =
            {
                title: "<span style='color:#007900;font-weight:bold;'>" + type.Name + "</span>",
                name: "NotifyType",
                inputValue: type,
                field: ["Id", "Code", "Name", "NotifyTypeValue"],
                onChecked: function (v) {
                    this.loadData(this.inputValue);
                    var parentId = this.parentCmp;
                    var parentCmp = EIAP.getCmp(parentId);
                    parentCmp.sysValidater();
                }
            };
            items.push(typedom);
        }
        var doRelation = function (v, items, ext) {
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i] == ext) {
                        continue;
                    }
                    var item = EIAP.getCmp(items[i]);
                    if (item.isDefined) {
                        if (item.isFormField) {
                            item.reset();
                            item.setReadOnly(!v);
                            item.allowBlank = !v;
                            if (item.xtype == "CheckBoxGroup") {
                                item.thisSysValidater();
                            } else {
                                item.sysValidater();
                            }
                        }
                        //仅做一层处理
                    }
                }
            }
        };
        return [
        {
            xtype: "FormPanel",
            height: 170,
            //id: 'FormPanel1130',
            defaultStyle: {
                labelWidth: 110,
                readonly: true
            },
            defaultType: "TextField",
            items: [{
                xtype: "CheckBox",
                name: "IsNotifyTaskExcutor",
                title: SEI.lang("通知任务执行人"),
                cellWidth: 150,
                readonly: false,
                onChecked: function (v) {
                    var parentId = this.parentCmp;
                    var formCmp = EIAP.getCmp(parentId);
                    doRelation(v, formCmp.items, this.id);
                }
            }, {
                xtype: "CheckBoxGroup",
                title: SEI.lang("通知方式"),
                name: "NotifyTypeGroup",
                labelWidth: 70,
                cellWidth: 395,
                defaultStyle: {
                    labelFirst: false,
                    labelWidth: 60
                },
                items: items,
                thisSysValidater: function () {
                    var g = this;
                    if (g.allowBlank) {
                        g.dom.fieldwrap.removeClass(g.invalidCls);
                        return;
                    }
                    g.sysValidater();
                }
            }, {
                xtype: "TextArea",
                title: SEI.lang("消息通知内容"),
                name: "NotifyMessage",
                maxlength: 200,
                width: 415
            },
            {
                xtype: "TextArea",
                title: SEI.lang("通知流程发起人内容"),
                name: "NotifyStarterMessage",
                maxlength: 200,
                width: 415
            }]
        }, {
            xtype: "FormPanel",
            boxCss: "ux-panel notify-panel",
            height: 100,
            defaultStyle: {
                labelWidth: 110,
                readonly: true
            },
            defaultType: "TextField",
            items: [{
                xtype: "CheckBox",
                name: "IsNotifyFlowStarter",
                title: SEI.lang("通知流程发起人"),
                cellWidth: 150,
                readonly: false,
                onChecked: function (v) {
                    var parentId = this.parentCmp;
                    var formCmp = EIAP.getCmp(parentId);
                    doRelation(v, formCmp.items, this.id);
                }
            }, {
                xtype: "CheckBoxGroup",
                readonly: false,
                title: SEI.lang("通知方式"),
                name: "NotifyTypeGroup",
                labelWidth: 70,
                cellWidth: 395,
                defaultStyle: {
                    labelFirst: false,
                    labelWidth: 60
                },
                items: items,
                thisSysValidater: function () {
                    var g = this;
                    if (g.allowBlank) {
                        g.dom.fieldwrap.removeClass(g.invalidCls);
                        return;
                    }
                    g.sysValidater();
                }
            }, {
                xtype: "TextArea",
                title: SEI.lang("消息通知内容"),
                name: "NotifyMessage",
                maxlength: 200,
                width: 415
            }]
        },
        {
            xtype: "FormPanel",
            height: 270,
            boxCss: "ux-panel notify-panel",
            defaultStyle: {
                labelWidth: 110,
                readonly: true
            },
            defaultType: "TextField",
            items: [{
                xtype: "CheckBox",
                name: "IsNotifyPosition",
                title: SEI.lang("通知相关岗位"),
                cellWidth: 150,
                readonly: false,
                onChecked: function (v) {
                    var parentId = this.parentCmp;
                    var formCmp = EIAP.getCmp(parentId);
                    doRelation(v, formCmp.items, this.id);
                }
            }, {
                xtype: "CheckBoxGroup",
                readonly: false,
                title: SEI.lang("通知方式"),
                name: "NotifyTypeGroup",
                labelWidth: 70,
                cellWidth: 395,
                defaultStyle: {
                    labelFirst: false,
                    labelWidth: 60
                },
                items: items,
                thisSysValidater: function () {
                    var g = this;
                    if (g.allowBlank) {
                        g.dom.fieldwrap.removeClass(g.invalidCls);
                        return;
                    }
                    g.sysValidater();
                }
            }, {
                xtype: "TextArea",
                title: SEI.lang("消息通知内容"),
                name: "NotifyMessage",
                maxlength: 200,
                width: 415
            }, {
                xtype: "GridPanel",
                renderTo: this.renderTo,
                width: 585,
                height: 172,
                tbar: initBar(),
                showSearch: false,
                id: 'NoticePsoitionGrid',
                gridCfg: {
                    loadonce: true,
                    colModel: [
                        { name: 'Id', hidden: true },
                        //{ name: 'GridSerialNumber', index: 'GridSerialNumber', label: SEI.lang("序号"), width: 80 },
                        { name: 'Name', index: 'Name', label: SEI.lang("岗位名称"), width: 120 },
                        { name: 'OrgPath', index: 'OrgPath', label: SEI.lang("岗位路径"), width: 180 },
                        { name: 'Code', index: 'Code', label: SEI.lang("岗位代码"), width: 80 }
                    ],
                    rowNum: 20,
                    shrinkToFit: false,
                    sortorder: 'asc',
                    sortname: 'PositionName'
                }
            }]
        }];
    },
    getNodeData: function () {
        var g = this;
        var nodeData = {};
        return nodeData;
    },
    getNodePosition: function () {
        var g = this;
        //获取节点坐标
        var parentPos = $(".flow-content").position();
        var item = $("#" + g.nodeCmpId);
        var x = item.position().left - parentPos.left + 6;
        var y = item.position().top - parentPos.top + 6;
        return { x: x, y: y };
    },
    loadNodeData: function (nodeData) {
        var g = this;
        switch (nodeData.NodeType) {
            case "StartNode":
                g.loadStartNodeData(nodeData);
                break;
            case "SingleTaskNode":
                g.loadSingleTaskNodeData(nodeData);
            default:
        }
    },
    loadStartNodeData: function (nodeData) {
        var g = this;
        EIAP.getCmp("nodeWin_Normal").loadData(nodeData);
    },
    loadSingleTaskNodeData: function (nodeData) {
        var g = this;
        var normalData = {
            Name: nodeData.Name,
            Remark: nodeData.Task.Remark,
            TaskName: nodeData.Task.Name,
            RatedWorkTime: nodeData.RatedWorkTime,
            NextNodeCmpId: nodeData.NextNodeCmpId,
            NextNodeName: nodeData.NextNodeName,
            NextNodeType: nodeData.NextNodeType,
            ResumeActionId: nodeData.Task.ResumeActionId,
            ResumeActionCode: nodeData.Task.ResumeActionCode,//后台返回结果没有值
            ResumeActionName: nodeData.Task.ResumeActionName,//后台返回结果没有值
            DefaultResumeNote: nodeData.Task.DefaultResumeNote,
            NeedAuthCheck: nodeData.NeedAuthCheck,
            NeedAuthCheckName: nodeData.NeedAuthCheckName//后台返回结果没有值
        }
        EIAP.getCmp("nodeWin_Normal").loadData(normalData);
        var operateData = {
            CanTerminate: nodeData.CanTerminate,
            CanRevokeByPreviousNode: nodeData.CanRevokeByPreviousNode,
            CanEditEntity: nodeData.Task.CanEditEntity,
            CanAutoExecut: nodeData.CanAutoExecut,
            CanSuspend: nodeData.CanSuspend,
            SuspendNote: nodeData.SuspendNote,
            IsUseWorkPage: nodeData.IsUseWorkPage,
            WorkPageName: nodeData.Task.WorkPageName,//后天返回结果没有值
            WorkPageUrl: nodeData.Task.WorkPageUrl,
            WorkPageId: nodeData.Task.WorkPageId,
            IsInvoke: nodeData.IsInvoke,
            MethodDisplayName: nodeData.Task.MethodDisplayName,
            MethodName: nodeData.Task.MethodName
        }
        EIAP.getCmp("nodeWin_Operate").loadData(operateData);
        EIAP.getCmp("setConditionGrid").setDataInGrid(nodeData.ExpressionNodes);
        var executorInfos = EIAP.getCmp("ExecutorChooseGroup");
        //$("#ExecutorChooseGroup").value = nodeData.Task.ExecutorChoose;
        EIAP.getCmp("nodeWinTabPanel").active(2);
        for (var i = 0; i < executorInfos.items.length; i++) {
            var item = EIAP.getCmp(executorInfos.items[i]);
            if (item.inputValue === nodeData.Task.ExecutorChoose) {
                var cm = EIAP.getCmp(EIAP.getCmp("ExecutorChooseGroup").items[i]);
                cm.dom.fieldicon.click();
                break;
            }
        }
        switch (nodeData.Task.ExecutorChoose) {
            case "PositionMark":
            case "PositionCategoryMark":
                EIAP.getCmp("box_" + nodeData.Task.ExecutorChoose).setDataInGrid(nodeData.Task.ExecutorInfos);//岗位信息只有Id
                break;
            case "PartnerMemberIsExecutorMark":
                EIAP.getCmp("box_" + nodeData.Task.ExecutorChoose).loadDa(nodeData.Task.ExecutorInfos);//自定义执行人只有Id
                break;
            case "StarterIsExecutorMark":
            case "ExecutorChoose":
                break;
            default:
        }
        EIAP.getCmp("nodeWinTabPanel").active(3);
        var panel_Notify = EIAP.getCmp("nodeWin_Notify");
        for (var i = 0; i < panel_Notify.items.length; i++) {
            var form = EIAP.getCmp(panel_Notify.items[i]);
            if (i === 0) {
                var notifyData = {
                    NotifyTypeGroup: nodeData.NotifyWays,
                    NotifyMessage: nodeData.NotifyBody,
                    NotifyStarterNote: nodeData.NotifyStarterNote
                }
                g.loadNoticeFormData(form, notifyData);
            }
            if (i === 1) {
                var notifyStarterData = {
                    NotifyTypeGroup: nodeData.Task.NotifyStarter,
                    NotifyMessage: nodeData.Task.NotifyStarterNote
                }
                g.loadNoticeFormData(form, notifyStarterData);
            }
            if (i === 2) {
                var notifyPositionData = {
                    NotifyTypeGroup: nodeData.Task.NotifyPosition,
                    NotifyMessage: nodeData.Task.NotifyPositionNote
                }
                g.loadNoticeFormData(form, notifyPositionData);
            }
        }
        EIAP.getCmp("NoticePsoitionGrid").setDataInGrid(nodeData.Task.ReceivePositionInfos);
        EIAP.getCmp("nodeWinTabPanel").active(0);
    },
    loadNoticeFormData: function (form, data) {
        if (data.NotifyTypeGroup.length > 0) {
            for (var i = 0; i < form.items.length; i++) {
                var item = EIAP.getCmp(form.items[i]);
                if (item.isDefined) {
                    if (item.isFormField) {
                        if (item.xtype == "CheckBoxGroup") {
                            for (var j = 0; j < item.items.length; j++) {
                                var groupItem = EIAP.getCmp(item.items[j]);
                                for (var k = 0; k < data.NotifyTypeGroup.length; k++) {
                                    if (groupItem.inputValue.Code == data.NotifyTypeGroup[k].Code) {
                                        EIAP.getCmp(item.items[j]).setValue(true);
                                        EIAP.getCmp(item.items[j]).setReadOnly(false);
                                    } else {
                                        EIAP.getCmp(item.items[j]).setReadOnly(false);
                                    }
                                }
                            }
                            EIAP.getCmp(form.items[i]).allowBlank = false;
                            EIAP.getCmp(form.items[i]).sysValidater();
                            //EIAP.getCmp(form.items[i]).setValue(true);
                        } else {
                            switch (item.name) {
                                case "NotifyMessage":
                                    EIAP.getCmp(form.items[i]).allowBlank = false;
                                    EIAP.getCmp(form.items[i]).setValue(data.NotifyMessage);
                                    EIAP.getCmp(form.items[i]).setReadOnly(false);
                                    EIAP.getCmp(form.items[i]).sysValidater();
                                    break;
                                case "NotifyStarterMessage":
                                    EIAP.getCmp(form.items[i]).allowBlank = false;
                                    EIAP.getCmp(form.items[i]).setValue(data.NotifyStarterNote);
                                    EIAP.getCmp(form.items[i]).setReadOnly(false);
                                    EIAP.getCmp(form.items[i]).sysValidater();
                                default:
                                    EIAP.getCmp(form.items[i]).allowBlank = false;
                                    EIAP.getCmp(form.items[i]).setReadOnly(false);
                                    EIAP.getCmp(form.items[i]).setValue(true);
                                    EIAP.getCmp(form.items[i]).sysValidater();
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }
});
EIAP.PositionMarkBox = function () {
    return new EIAP.controls.PositionMarkBox(arguments[0]);
};
EIAP.controls.PositionMarkBox = EIAP.extend(EIAP.CustomUI, {
    renderTo: null,
    initComponent: function () {
        var g = this;
        EIAP.GridPanel({
            renderTo: this.renderTo,
            width: 585,
            height: 393,
            tbar: this.initBar(),
            showSearch: false,
            id: g.renderTo,
            gridCfg: {
                loadonce: true,
                colModel: [
                    { name: 'Id', hidden: true },
                    //{ name: 'GridSerialNumber', index: 'GridSerialNumber', label: SEI.lang("序号"), width: 80,hidden:true },
                    { name: 'Name', index: 'Name', label: SEI.lang("岗位名称"), width: 80 },
                    { name: 'OrgPath', index: 'OrgPath', label: SEI.lang("岗位路径"), align: "center", width: 200 },
                    { name: 'Code', index: 'Code', label: SEI.lang("岗位代码"), width: 80 }
                ],
                rowNum: 20,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'GridSerialNumber'
            }
        });
    },
    initBar: function () {
        var g = this;
        return [{
            title: SEI.lang("新增"),
            iconCls: "icon-common-add",
            handler: function () {
                var positionSelect = new EIAP.PositionSelect({
                    cmpId: g.renderTo
                });
            }
        }, {
            title: SEI.lang("删除"),
            iconCls: "icon-common-delete",
            handler: function () {
                var grid = EIAP.getCmp(g.renderTo);
                var rowId = grid.getSelectRow();
                if (rowId.length == 0) {
                    EIAP.Msg.alert("操作提示", "请选择需要删除的行项目！");
                } else {
                    EIAP.Msg.confirm("删除警告", "您确定要删除选择的行项目吗?", function (btn) {
                        if (btn == "yes") {
                            var id = grid.grid.jqGrid('getGridParam', 'selrow');
                            grid.grid.jqGrid('delRowData', id);
                        }
                    });
                }
            }
        }];
    }
});
EIAP.PositionCategoryMarkBox = function () {
    return new EIAP.controls.PositionCategoryMarkBox(arguments[0]);
};
EIAP.controls.PositionCategoryMarkBox = EIAP.extend(EIAP.CustomUI, {
    renderTo: null,
    initComponent: function () {
        var g = this;
        EIAP.GridPanel({
            renderTo: this.renderTo,
            width: 585,
            height: 393,
            tbar: this.initBar(),
            showSearch: false,
            id: g.renderTo,
            gridCfg: {
                loadonce: true,
                colModel: [
                    { name: 'Id', hidden: true },
                    //{ name: 'GridSerialNumber', index: 'GridSerialNumber', label: SEI.lang("序号"), width: 80 },
                    { name: 'PositionCategoryName', index: 'PositionCategoryName', label: SEI.lang("岗位内部名称"), width: 200 }
                ],
                rowNum: 20,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'GridSerialNumber'
            }
        });
    },
    initBar: function () {
        var g = this;
        return [{
            title: SEI.lang("新增"),
            iconCls: "icon-common-add",
            handler: function () {
                var positionCategorySelelctWindow = new EIAP.PositionCategorySelect({
                    cmpId: g.renderTo
                });
            }
        }, {
            title: SEI.lang("删除"),
            iconCls: "icon-common-delete",
            handler: function () {
                var grid = EIAP.getCmp(g.renderTo);
                var rowId = grid.getSelectRow();
                if (rowId.length == 0) {
                    EIAP.Msg.alert("操作提示", "请选择需要删除的行项目！");
                } else {
                    EIAP.Msg.confirm("删除警告", "您确定要删除选择的行项目吗?", function (btn) {
                        if (btn == "yes") {
                            var id = grid.grid.jqGrid('getGridParam', 'selrow');
                            grid.grid.jqGrid('delRowData', id);
                        }
                    });
                }
            }
        }];
    }
});
EIAP.PartnerMemberIsExecutorMarkBox = function () {
    return new EIAP.controls.PartnerMemberIsExecutorMarkBox(arguments[0]);
};
EIAP.controls.PartnerMemberIsExecutorMarkBox = EIAP.extend(EIAP.CustomUI, {
    renderTo: null,
    initComponent: function () {
        var g = this;
        EIAP.FormPanel({
            id: g.renderTo,
            renderTo: this.renderTo,
            width: 585,
            height: 393,
            items: [
                {
                    xtype: "ComboGrid",
                    cellWidth: 500,
                    labelWidth: 150,
                    width: 320,
                    title: SEI.lang("自定义执行人"),
                    name: "ExecuteTypeName",
                    canClear: false,
                    field: ["ExecuteTypeId", "ExecuteTypeCode"],
                    store: { url: "../../BusinessFlowConfig/GetEntityExecutors/", params: { flowTypeId: g.orderCmp.mainCmp.businessFlowData.BusinessFlowTypeId } },
                    //url: '' + g.orderCmp.mainCmp.businessFlowData.BusinessFlowTypeId,
                    allowBlank: true,
                    gridCfg: {
                        url: "../../BusinessFlowConfig/GetEntityExecutors/",
                        postData: { flowTypeId: g.orderCmp.mainCmp.businessFlowData.BusinessFlowTypeId },
                        loadonce: false,
                        //shrinkToFit: false,
                        colModel: [
                            { name: "Id", hidden: true },
                            { name: "Code", hidden: true },
                            { name: "Name", index: 'Name', label: SEI.lang("名称"), width: '80' }
                        ]
                    },
                    reader: {
                        name: "Name",
                        field: ["Id", "Code"]
                    }
                }
            ]
        });
        //EIAP.GridPanel({
        //    renderTo: this.renderTo,
        //    width: 585,
        //    height: 393,
        //    tbar: this.initBar(),
        //    showSearch: false,
        //    gridCfg: {
        //        loadonce: true,
        //        colModel: [
        //            { name: 'Id', hidden: true },
        //            //{ name: 'GridSerialNumber', index: 'GridSerialNumber', label: SEI.lang("序号"), width: 80 },
        //            { name: 'ExecuteTypeCode', index: 'ExecuteTypeCode', label: SEI.lang("执行类型编码"), width: 120 },
        //            { name: 'ExecuteTypeName', index: 'ExecuteTypeName', label: SEI.lang("执行类型名称"), width: 180 }
        //        ],
        //        rowNum: 20,
        //        shrinkToFit: false,
        //        sortorder: 'asc',
        //        sortname: 'GridSerialNumber'
        //    }
        //});
    },
    initBar: function () {
        var g = this;
        return [{
            title: SEI.lang("新增"),
            iconCls: "icon-common-add",
            handler: function () {
                var partnerMemberSelect = new EIAP.PartnerMemberIsExecutorSelect({
                    cmpId: g.renderTo,
                    flowTypeId: g.orderCmp.mainCmp.businessFlowData.BusinessFlowTypeId
                });
            }
        }, {
            title: SEI.lang("删除"),
            iconCls: "icon-common-delete",
            handler: function () {
                var grid = EIAP.getCmp(g.renderTo);
                var rowId = grid.getSelectRow();
                if (rowId.length == 0) {
                    EIAP.Msg.alert("操作提示", "请选择需要删除的行项目！");
                } else {
                    EIAP.Msg.confirm("删除警告", "您确定要删除选择的行项目吗?", function (btn) {
                        if (btn == "yes") {
                            var id = grid.grid.jqGrid('getGridParam', 'selrow');
                            grid.grid.jqGrid('delRowData', id);
                        }
                    });
                }
            }
        }];
    }
});
EIAP.ControlConditionConfig = EIAP.extend(EIAP.CustomUI, {
    title: "条件控制",
    cmpId: "",
    isStartControl: false,
    flowTypeId: null,
    isEdit: false,
    expressionHistory: [],
    initComponent: function () {
        var g = this;
        this.window = EIAP.Window({
            width: 600,
            height: 350,
            title: this.title,
            layout: "border",
            buttons: g.getButtons(),
            items: [
                g.initAttribute(),
                g.initOperator(),
                g.initControlForm()
            ]
        });
        if (g.isEdit) {
            g.loadExpression();
        }
        //g.loadHistory();
    },
    initAttribute: function () {
        var g = this;
        return {
            xtype: "GridPanel",
            title: SEI.lang("属性"),
            width: 400,
            height: 180,
            region: 'west',
            showSearch: false,
            id: 'attributeGrid',
            gridCfg: {
                postData: { id: g.flowTypeId },
                url: "../../BusinessFlowConfig/GetConditionPropertyInfos",
                colModel: [
                    { name: 'Id', hidden: true },
                    { name: 'Name', index: 'Name', label: SEI.lang("属性名"), width: 80 },
                    { name: 'TypeName', index: 'TypeName', label: SEI.lang("属性类型"), width: 80 },
                    { name: 'DisplayName', index: 'DisplayName', label: SEI.lang("属性描述"), width: 120 }
                ],
                rowNum: 100,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Name',
                onSelectRow: function (rowId) {
                    var row = EIAP.getCmp("attributeGrid").getSelectRow();
                    g.setExpression(row.Name);
                }
            }
        }
    },
    initOperator: function () {
        var g = this;
        return {
            xtype: "GridPanel",
            width: 120,
            height: 180,
            region: 'center',
            title: SEI.lang("操作符"),
            showSearch: false,
            id: 'Operator',
            gridCfg: {
                url: "../../BusinessFlowConfig/GetConditionPropertyOperatorInfos/",
                colModel: [
                    { name: 'Name', index: 'Name', label: SEI.lang("操作符"), width: 80 }
                ],
                rowNum: 100,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Name',
                onSelectRow: function () {
                    var row = EIAP.getCmp("Operator").getSelectRow();
                    g.setExpression(row.Name);
                }
            }
        }
    },
    initControlForm: function () {
        var g = this;
        return {
            title: SEI.lang("控制条件"),
            xtype: "FormPanel",
            padding: 0,
            width: 586,
            height: 150,
            region: 'south',
            id: 'ControlForm',
            items: [
                {
                    xtype: 'TextField',
                    name: 'Id',
                    hidden: true
                },
                {
                    xtype: 'TextArea',
                    name: 'Expression',
                    id: 'expression',
                    height: 115,
                    width: 580,
                    listener: {
                        "change": function () {
                            var data = EIAP.getCmp("expression").getValue();
                            g.expressionHistory.push(data);
                        }
                    }
                },
                 {
                     xtype: "ComboBox",
                     title: SEI.lang("设置下一步节点"),
                     name: "NextNodeName",
                     canClear: false,
                     labelWidth: 120,
                     hidden: g.isStartControl,
                     field: ["NextNodeCmpId", "NextNodeType"],
                     data: g.orderCmp.getCanSelectNodes(),
                     reader: {
                         name: "Name",
                         field: ["Id", "Type"]
                     }
                 }
            ]
        }
    },
    getButtons: function () {
        var g = this;
        return [
            {
                title: SEI.lang("保存配置"),
                width: 50,
                iconCls: "icon-common-save",
                handler: function () {
                    var formData = EIAP.getCmp("ControlForm").getFormValue();
                    if (formData.Id === "") {
                        formData.Id = EIAP.util.Guid.newGuid();
                    }
                    if (g.isStartControl) {
                        formData.NextNodeName = SEI.lang("开始节点");
                        formData.NextNodeType = "StartNode";
                        formData.NextNodeCmpId = "";
                    }
                    if (formData) {
                        if (formData.Expression != "" || formData.NextNodeName != "") {
                            if (formData.Expression == "" || formData.NextNodeName == "") {
                                var status = { StatusSign: 1, Message: SEI.lang("请确保表达式和下步节填写完整") };
                                EIAP.ProcessStatus({ status: status });
                            } else {
                                $.post('../../BusinessFlowConfig/WorkFlowCheckExpression/', { id: g.orderCmp.mainCmp.businessFlowData.BusinessFlowTypeId, expression: formData.Expression }, function (status) {
                                    if (status.Sucessed) {
                                        if (g.isStartControl) {
                                            g.orderCmp.mainCmp.startNodeExpressionInfo = formData;
                                        } else {
                                            if (g.isEdit) {
                                                var rowId = EIAP.getCmp(g.cmpId).grid.getGridParam("selrow");
                                                EIAP.getCmp(g.cmpId).grid.setRowData(rowId, formData);
                                            } else {
                                                var gridLength = EIAP.getCmp(g.cmpId).getGridData().length;
                                                EIAP.getCmp(g.cmpId).grid.jqGrid('addRowData', (gridLength + 1), formData);
                                            }
                                        }
                                        g.window.close();
                                    } else {
                                        EIAP.ProcessStatus({ status: status });
                                    }
                                });
                            }
                        } else {
                            g.window.close();
                        }
                    }
                }
            },
            {
                title: SEI.lang("取消"),
                width: 40,
                iconCls: "icon-common-cross",
                handler: function () {
                    g.window.close();
                }
            },
            {
                title: SEI.lang("撤销上一组输入"),
                width: 60,
                iconCls: "icon-flow-arrowreturnleft",
                handler: function () {
                    g.revocation();
                }
            }
        ];
    },
    setExpression: function (expressionName) {
        var g = this;
        var expressionText = EIAP.getCmp("expression").getValue();
        if (expressionText == null) {
            expressionText = "";
        }
        expressionText = expressionText + expressionName + " ";
        g.expressionHistory.push(expressionText);
        EIAP.getCmp("expression").setValue(expressionText);
    },
    revocation: function () {
        var g = this;
        var expressionText = "";
        var length = g.expressionHistory.length;
        if (length > 1) {
            expressionText = g.expressionHistory[length - 2];
            g.expressionHistory.pop();
        }
        if (length == 1) {
            g.expressionHistory.pop();
        }
        EIAP.getCmp("expression").setValue(expressionText);
    },
    loadExpression: function () {
        var g = this;
        if (g.isStartControl) {
            EIAP.getCmp("ControlForm").loadData(g.orderCmp.mainCmp.startNodeExpressionInfo);
        } else {
            var data = EIAP.getCmp(g.cmpId).getSelectRow();
            EIAP.getCmp("ControlForm").loadData(data);
        }
    }
});
EIAP.PositionSelect = EIAP.extend(EIAP.CustomUI, {
    title: "岗位选择",
    cmpId: "",
    initComponent: function () {
        var g = this;
        this.window = EIAP.Window({
            width: 600,
            height: 300,
            title: this.title,
            layout: "border",
            buttons: g.getButtons(),
            items: [
                g.initOrganization(),
                g.initPosition()
            ]
        });
        g.loadTreeData();
    },
    getButtons: function () {
        var g = this;
        return [
            {
                title: SEI.lang("保存配置"),
                width: 50,
                iconCls: "icon-common-save",
                handler: function () {
                    var selectData = EIAP.getCmp("selectPositionGrid").getSelectRow();
                    var cmpGridData = EIAP.getCmp(g.cmpId).getGridData();
                    var gridSerialNumber = cmpGridData.length + 1;
                    for (var i = 0; i < selectData.length; i++) {
                        for (var k = 0; k < cmpGridData.length; k++) {
                            if (cmpGridData[k].Code === selectData[i].Code) {
                                EIAP.Msg.alert("操作提示", "该条行项目已存在（" + selectData[i].Name + "）！");
                                return false;
                            }
                        }
                        EIAP.getCmp(g.cmpId).grid.jqGrid('addRowData', (gridSerialNumber), selectData[i]);
                        gridSerialNumber++;
                    }
                    g.window.close();
                }
            },
            {
                title: SEI.lang("取消"),
                width: 40,
                iconCls: "icon-common-cross",
                handler: function () {
                    g.window.close();
                }
            }
        ];
    },
    initOrganization: function () {
        var g = this;
        return {
            xtype: "TreePanel",
            region: "west",
            title: "组织机构",
            nodeWidth: 220,
            width: 200,
            id: 'positionOrganizationTree',
            collapsible: true,
            iconCls: "icon-common-branch",
            //url:"../../BusinessFlowConfig/GetTree/",
            bbar: [
                {
                    xtype: 'SearchBox',
                    name: 'searchcmp',
                    width: 300,
                    onSearch: function (v) {
                        EIAP.getCmp("inittree").tree.filter(v);
                    }
                }
            ],
            onClick: function (node) {
                g.loadPosition(node.data.id);
            }
        }
    },
    loadTreeData: function () {
        var g = this;
        var myitemmask = EIAP.LoadMask(EIAP.getCmp("positionOrganizationTree"), { msg: SEI.lang("正在努力获取数据，请稍后...") });
        var e = {
            showLoading: function () {
                myitemmask.show();
            },
            hideLoading: function () {
                myitemmask.hide();
            }
        };
        EIAP.getCmp("positionOrganizationTree").tree.loadData(null, "../../BusinessFlowConfig/GetTree/", null, e);
    },
    initPosition: function () {
        var g = this;
        return {
            xtype: "GridPanel",
            width: 380,
            height: 180,
            region: 'center',
            id: 'selectPositionGrid',
            title: SEI.lang("岗位"),
            showSearch: true,
            gridCfg: {
                loadonce: true,
                url: "../../BusinessFlowConfig/GetPositionsByOrg/",
                colModel: [
                    { name: 'Id', hidden: true },
                    { name: 'Name', index: 'Name', label: SEI.lang("岗位名称"), width: 100 },
                    { name: 'Code', index: 'Code', label: SEI.lang("岗位代码"), width: 100 },
                    { name: 'OrgPath', index: 'OrgPath', label: SEI.lang("岗位路径"), width: 100 }
                ],
                rowNum: 100,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Name',
                multiselect: true
            }
        }
    },
    loadPosition: function (nodeId) {
        var g = this;
        var postData = { orgId: nodeId }
        var grid = EIAP.getCmp("selectPositionGrid");
        grid.setPostParams(postData);
        grid.refreshGrid();
    }
});
EIAP.PositionCategorySelect = EIAP.extend(EIAP.CustomUI, {
    title: "岗位类别选择",
    cmpId: "",
    initComponent: function () {
        var g = this;
        this.window = EIAP.Window({
            width: 600,
            height: 300,
            title: this.title,
            buttons: g.getButtons(),
            items: [
                g.initPositionCategoryGird()
            ]
        });
    },
    initPositionCategoryGird: function () {
        var g = this;
        return {
            xtype: "GridPanel",
            region: 'center',
            id: 'selectPositionCategoryGrid',
            title: SEI.lang("岗位类别"),
            showSearch: true,
            gridCfg: {
                //loadonce: true,
                url: "../../BusinessFlowConfig/GetAllPositionCategories/",
                colModel: [
                    { name: 'Id', hidden: true },
                    { name: 'Name', index: 'Name', label: SEI.lang("岗位类别名称"), width: 100 },
                    { name: 'Code', index: 'Code', label: SEI.lang("岗位类别代码"), width: 100 }
                ],
                rowNum: 100,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Name',
                multiselect: true
            }
        }
    },
    getButtons: function () {
        var g = this;
        return [
            {
                title: SEI.lang("保存配置"),
                width: 50,
                iconCls: "icon-common-save",
                handler: function () {
                    var selectData = EIAP.getCmp("selectPositionCategoryGrid").getSelectRow();
                    var cmpGridData = EIAP.getCmp(g.cmpId).getGridData();
                    var gridSerialNumber = cmpGridData.length + 1;
                    for (var i = 0; i < selectData.length; i++) {
                        for (var k = 0; k < cmpGridData.length; k++) {
                            if (cmpGridData[k].PositionCategoryName === selectData[i].Name) {
                                EIAP.Msg.alert("操作提示", "该条行项目已存在（" + selectData[i].Name + "）！");
                                return false;
                            }
                        }
                        selectData[i].PositionCategoryName = selectData[i].Name;
                        EIAP.getCmp(g.cmpId).grid.jqGrid('addRowData', (gridSerialNumber), selectData[i]);
                        gridSerialNumber++;
                    }
                    g.window.close();
                }
            },
            {
                title: SEI.lang("取消"),
                width: 40,
                iconCls: "icon-common-cross",
                handler: function () {
                    g.window.close();
                }
            }
        ];
    }
});
EIAP.PartnerMemberIsExecutorSelect = EIAP.extend(EIAP.CustomUI, {
    title: "自定义执行人选择",
    cmpId: "",
    flowTypeId: null,
    initComponent: function () {
        var g = this;
        this.window = EIAP.Window({
            width: 600,
            height: 300,
            title: this.title,
            buttons: g.getButtons(),
            items: [
                g.initPartnerMemberIsExecutorGird()
            ]
        });
    },
    initPartnerMemberIsExecutorGird: function () {
        var g = this;
        return {
            xtype: "GridPanel",
            region: 'center',
            id: 'selectPartnerMemberIsExecutorGrid',
            title: SEI.lang("自定义执行人"),
            showSearch: true,
            gridCfg: {
                postData: { flowTypeId: g.flowTypeId },
                url: "../../BusinessFlowConfig/GetEntityExecutors/",
                colModel: [
                    { name: 'Id', hidden: true },
                    { name: 'Code', index: 'Code', label: SEI.lang("执行类型编码"), width: 100 },
                    { name: 'Name', index: 'Name', label: SEI.lang("执行类型名称"), width: 100 }
                ],
                rowNum: 100,
                shrinkToFit: false,
                sortorder: 'asc',
                sortname: 'Name',
                multiselect: true
            }
        }
    },
    getButtons: function () {
        var g = this;
        return [
            {
                title: SEI.lang("保存配置"),
                width: 50,
                iconCls: "icon-common-save",
                handler: function () {
                    var selectData = EIAP.getCmp("selectPartnerMemberIsExecutorGrid").getSelectRow();
                    var cmpGridData = EIAP.getCmp(g.cmpId).getGridData();
                    var gridSerialNumber = cmpGridData.length + 1;
                    for (var i = 0; i < selectData.length; i++) {
                        for (var k = 0; k < cmpGridData.length; k++) {
                            if (cmpGridData[k].ExecuteTypeCode === selectData[i].Code) {
                                EIAP.Msg.alert("操作提示", "该条行项目已存在（" + selectData[i].Name + "）！");
                                return false;
                            }
                        }
                        selectData[i].ExecuteTypeCode = selectData[i].Code;
                        selectData[i].ExecuteTypeName = selectData[i].Name;
                        EIAP.getCmp(g.cmpId).grid.jqGrid('addRowData', (gridSerialNumber), selectData[i]);
                        gridSerialNumber++;
                    }
                    g.window.close();
                }
            },
            {
                title: SEI.lang("取消"),
                width: 40,
                iconCls: "icon-common-cross",
                handler: function () {
                    g.window.close();
                }
            }
        ];
    }
});