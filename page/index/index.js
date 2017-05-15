const app = getApp();
const URL = app.globalData.http_url;
const UTIL = require('../../util/util.js');
const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;

Page({
    data: {
        caiItems: [],
        loading: true,
        hasMore: false,
        page: 1,
        pageSize: 15,
        totalNum : 1 ,
        userInfo : '',
        roleName : '' ,
        winHeight: 0,
        canCreateOrder: false,
        scrollTop: 0,
        token: '' ,
        wxOpenId: '',
        noUserInfo: true
    },
    onLoad: function () {
        this.setData({
            page: 1,
            winHeight: winHeight
        });   
    },  
    onShow: function(){
        this.init();
        this.refresh();
    }, 
    onReachBottom: function() {
    // Do something when page reach bottom.
        console.log("bottom");
        let pageN = this.data.page+1;
        this.setData({ page: pageN });
        this.getDataFromServer(pageN);
    },
    onPullDownRefresh: function() {
    // Do something when pull down.
        console.log("bottom1");
        this.setData({
            caiItems : [],
            scrollTop : 0,
            page: 1
        });
        this.getDataFromServer(this.data.page,"stopPullDown");
        
    },
    init: function(){
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let roleType = userInfo.roleName;
        let token = userInfo.token;
        let wxOpenId = userInfo.wxOpenId;  

        if(!!userInfo){
            that.setData({
                userInfo : userInfo,
                roleName: roleType,
                token: token,
                wxOpenId: wxOpenId,
                caiItems: [],
                noUserInfo: false
            }); 
        }else{
            that.setData({
                userInfo : '',
                roleName: '',
                token: '',
                wxOpenId: '',
                caiItems: [],
                noUserInfo: true
            }); 
        }
    },
    refresh: function () {  
        this.setData({
            caiItems : [],
            scrollTop : 0,
            page: 1
        });
        this.getDataFromServer(this.data.page);
    },
    // loadMore: function () {
    //     console.log("loadMore");
    //     let pageN = this.data.page+1;
    //     this.setData({ page: pageN });
    //     this.getDataFromServer(pageN);
    // },
    // scroll: function(e){
    //     console.log(1);
    //     this.setData({
    //         scrollTop : e.detail.scrollTop
    //     });
    // },
    //获取网络数据的方法
    getDataFromServer: function (page,stopPullDown) {

        let that = this;
        let totalNum = that.data.totalNum;

        if( page > totalNum ){
            wx.stopPullDownRefresh();
            app.showToastFn('没有数据');
            that.setData({
                loading: true, 
                hasMore: false
            });            
            return false;                    
        }

        this.setData({
            loading: false,
            hasMore: true
        });

        let success = function(res,stopPullDown){
        
            if(res.data.response_state==-1){
                app.showToastFn("数据请求错误");
                that.setData({
                    loading: true, 
                    hasMore: false
                });
            }
            if( res.data.response_state==1 ){
                let canCreateOrder = res.data.canCreateOrder;

                if(!!canCreateOrder){
                    that.setData({
                        canCreateOrder : true                    
                    });                        
                }    

                let caiItems = res.data.list;
                let caiItem_arr = that.data.caiItems;
                let caiItem_brr = [];

                if(!!caiItems){
                    caiItems.forEach( ( item, i ) => {
                        item.dueDate = UTIL.formatDate( new Date(item.dueDate) );
                        item.dueTime = UTIL.formatDate3( new Date(item.dueTime) );

                        item.estimateFee = Math.round( item.estimateFee  );     
                        item.distance = Math.round( item.distance ); 

                        if( item.fromCity == item.toCity){
                            if( !!item.toCounty && !!item.fromCounty){
                                item['onCity'] = true;     
                            }else{
                                item['onCity'] = false;         
                            }
                        }else{
                            item['onCity'] = false;               
                        }

                    });   
                    caiItem_brr = caiItem_arr.concat(caiItems);
                    that.setData({
                        totalNum: res.data.totalPage,                    
                        caiItems:  caiItem_brr
                    }); 
                } 
                that.setData({
                    loading: true, 
                    hasMore: false
                });        
            //     console.log(stopPullDown,"stopPullDown2");
            // if(stopPullDown){
            //     console.log(stopPullDown,"stopPullDown")
            //     wx.stopPullDownRefresh();
            // }            
            }
        }

        let fail = function(error){
            that.setData({
                page: that.data.page-1
            });
            app.showToastFn("请求数据失败，请重试");
        }
        // 首页没登录的时候调用的是司机的
        let token = that.data.token;
        let roleName = that.data.roleName;

        if(!token){
            wx.request( {  // 没有登录
                url: URL + "mobile/desire/driver",
                data: {
                    "pageSize": that.data.pageSize,
                    "pageNum":page
                },
                method: "GET",
                success: function(res){
                        success(res);
                    },
                fail: fail,
                complete:function(){
                    console.log(stopPullDown,"stopPullDown")
                    wx.stopPullDownRefresh();
                }
            });
        }else{
            if( roleName == "ROLE_DRIVER" || roleName == "ROLE_MANAGER"){  
                wx.request( {  // 司机  调度
                    url: URL + "mobile/desire/driver",
                    data: {
                        "token": that.data.token,
                        "pageSize": that.data.pageSize,
                        "pageNum":page
                    },
                    method: "GET",
                    success: function(res){
                            success(res);
                    },
                    fail: fail,
                    complete:function(){
                    wx.stopPullDownRefresh();
                }
                });
            }
            if( roleName == "ROLE_CUSTOMER" ){
                // 客户
                wx.request( {
                    url: URL + "mobile/desire/all",
                    data: {
                        "pageSize": that.data.pageSize,
                        "pageNum":page,
                        "token": that.data.token
                    },
                    method: "GET",
                    success: function(res){
                          success(res);
                    },
                    fail: fail,
                    complete:function(){
                    wx.stopPullDownRefresh();
                }
                });
            }
        }
    },
    bindRelease: function(e){
        
        let that =this;
        if(!!that.data.token){ // 用户存在 
            wx.navigateTo({
                url: '../release/release',
                success: function(res){
                    // success
                },
                fail: function() {
                    // fail
                },
                complete: function() {
                    // complete
                }
            })           
        }else{
           app.goLog(); 
        }
    },
    bindRobOrder: function( e ){
        let that = this;
        if( !that.data.token ){
           app.goLog(); 
           return false;
        }
        let desireId = e.currentTarget.dataset.id;
        let status = e.currentTarget.dataset.status;     

        if(status=="TRADED"){
            app.showToastFn("此单已被抢");
            return false;            
        }

        let roleName = that.data.roleName;

        if(roleName == "ROLE_DRIVER"){
            let canCreateOrder = that.data.canCreateOrder;

            if( !canCreateOrder ){ //不能抢单
                app.showToastFn("当前您不能抢单");
                return false;
            }               
            wx.request({
                url: URL + 'mobile/order',
                data: {
                    token: that.data.token,
                    desireId: desireId
                },
                method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: {  
                    "Content-Type": "application/x-www-form-urlencoded"  
                },  
                success: function(res){
                    if( res.data.response_state == 1){
                        app.showToastFn("抢单成功");
                        that.refresh();
                    }else{
                        app.showToastFn(res.data.response_note);                    
                    }
                },
                fail: function() {
                  app.showToastFn("出错了");   
                },
                complete: function() {
                    // complete
                }
            });
        }  
        if(roleName == "ROLE_MANAGER"){
            wx.request({
                url: URL+'mobile/desire/lock',
                data: {
                    token: that.data.token,
                    desireId: desireId
                },
                method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: {  
                    "Content-Type": "application/x-www-form-urlencoded"  
                },  
                success: function(res){
                    if( res.data.response_state == 1 ){
                        app.showToastFn("货源锁定成功",function(){
                            wx.navigateTo({
                                url: '../driverList/driverList?desireId='+desireId,
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
                        app.showToastFn('调度抢单失败');        
                    }
                },
                fail: function() {
                // fail
                },
                complete: function() {
                // complete
                }
            });
        }            
    },
    onShareAppMessage: function () {
        return {
            title: '首页',
            path: '/page/index/index'
        }
    }       
});
