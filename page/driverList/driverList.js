const app = getApp();
const URL = app.globalData.http_url;
const imgSrc = app.globalData.imgSrc;
const UTIL = require('../../util/util.js');
const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;

Page({
   data: {
       driverList: [],
       winHeight: 0,
       userInfo: '',
       token: '',
       roleType: '',
       robTrue: false,
       driverId: '',
       desireId: ''
   },
   onLoad: function(options){
       let that = this;
       let desireId = options.desireId;
       let userInfo = wx.getStorageSync('userInfo');
       let token = userInfo.token;
       let roleType = userInfo.roleType;
       
       that.setData({
            winHeight: winHeight,
            userInfo: userInfo,
            token: token,
            roleType: roleType,
            desireId: desireId
        });
        wx.request({
            url: URL+'mobile/user/driverList',
            data: {
                token: that.data.token
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // header: {}, // 设置请求的 header
            success: function(res){
                if( res.data.response_state == 1){ 
                    let driverList = res.data.list;

                    driverList.forEach( ( item, i ) => {
                        item.dueDate = UTIL.formatDate2( new Date(item.dueDate) );
                        if(!!item.photo){
                            item.photo = imgSrc + item.photo;
                        }   
                    });    
                    that.setData({
                        driverList : driverList
                    });
                }else{
                    app.showToastFn('throw error ' + res.data.response_note);
                }
            },
            fail: function() {
                app.showToastFn("出错啦");        
            },
            complete: function() {
                // complete
            }
        });        
   },
   bindRobOrder: function(e){ //指派订单
        let that = this;
        let desireId = that.data.desireId;   
        let driverId = e.currentTarget.dataset.id; 

        if( !driverId){
            app.showToastFn('出错了,请联系客服');
            return;
        }
        if( !desireId ){ 
            app.showToastFn('请回到上一页重新抢单');
            return;            
        }
        wx.request({
            url: URL + 'mobile/order',
            data: {
                token: that.data.token,
                desireId: desireId,
                driverId: driverId
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {  
                "Content-Type": "application/x-www-form-urlencoded"  
            },  
            success: function(res){
                // success
                let data = res.data;
                if( data.response_state ==1 ){
                    that.setData({
                        robTrue: true
                    });
                    app.showToastFn("抢单成功",function(){
                        wx.navigateBack({
                            delta: 1, // 回退前 delta(默认为1) 页面
                            success: function(res){
                            // success
                            },
                            fail: function() {
                            // fail
                            },
                            complete: function() {
                            // complete
                            }
                        });                        
                    });
                }else{
                    app.showToastFn(data.response_note);        
                }        
            },
            fail: function() {
                app.showToastFn("出错了");   
            },
            complete: function() {
                // complete
            }
        })
   },
   makePhone: function(e){
    let phone = e.currentTarget.dataset.phone;    
    if( !phone ){
        app.showToastFn('司机号码不存在');
    }else{
        wx.makePhoneCall({
        phoneNumber: phone,
        success: function(res) {
            // success
        }
        })        
    }
   },
   onUnload: function(){ 
    let that = this;
    let robTrue = this.data.robTrue;
    if( !robTrue ){ //调度未指派司机
        let token = that.data.token;
        let desireId = that.data.desireId;
        wx.request({
            url: URL + 'mobile/desire/unlock',
            data: {
                token: that.data.token,
                desireId: desireId
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {  
                "Content-Type": "application/x-www-form-urlencoded"  
            },  
            success: function(res){
                if( res.data.response_state ==1 ){
                    app.showToastFn( '解除锁定成功');
                }else if(res.data.response_state == -1){
                    app.showToastFn( '解除锁定失败');
                }else{
                    app.showToastFn( res.data.response_note );
                }
            }
        });
    }
   } 
});