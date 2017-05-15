const app = getApp();
const URL = app.globalData.http_url;
const util = require('../../util/util.js');
const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;

Page({
    data:{
        selected:false,
        selected1:false,
        selected2:false,
        orderItems: [],  
        desireItem: [],    
        loading:true,
        hasMore: false,
        page: 1,      
        pageSize: 15,
        totalNum : 1,
        driverF: false,
        manager: false,
        userId: 0,
        winHeight: 0,
        hgt: 0,
        scrollTop: 0,
        userInfo: '',
        token: '',
        roleType: ''       
    },
    onLoad: function (options) {
        let hgt = winHeight -50;
        this.setData({
            page:1,            
            winHeight: winHeight,
            hgt: hgt,
            orderItems: [],  
            desireItem: [],
            totalNum: 0
        });

        let userInfo = wx.getStorageSync('userInfo');
        let roleType = userInfo.roleName;
        let token = userInfo.token;

        if(roleType == "ROLE_DRIVER" ){ // 是司机的话
            this.setData({
                selected: true,
                selected2: false,
                selected1 : false,                   
                driverF: false
            });
        }else{
            this.setData({
                selected2:true,
                selected1 : false,                   
                selected : false,
                driverF: true
            });            
        }
        if( roleType == "MANAGER" ){ // 是调度
            that.setData({
                manager: true                
            });
        }          
    },
    init: function(){
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let roleType = userInfo.roleName;
        let token = userInfo.token;
        let wxOpenId = userInfo.wxOpenId;   

        if( !userInfo ){
            that.setData({        
                userId: '',
                userInfo: '',
                roleType: '',
                token:'',
                wxOpenId:''
            }); 
            app.goLog();
        }else{
            that.setData({        
                userId: userInfo.id,
                userInfo: userInfo,
                roleType: roleType,
                token:token,
                wxOpenId:wxOpenId
            });
        }
    },
    onShow: function(){
        this.init();
        this.refresh();
    },
    selected:function(e){ // 进行中
        this.setData({
            selected:true,
            selected1:false,             
            selected2:false,               
            page: 1,
            orderItems: [],  
            desireItem: [],
            scrollTop : 0                                 
        });
        this.getDataFromServer(this.data.page,"START"); 
    },
    selected1:function(e){ // 已完成
        this.setData({
            selected:false,
            selected1:true,
            selected2:false,
            page: 1,
            orderItems: [],  
            desireItem: [],
            scrollTop : 0                         
        });
        this.getDataFromServer(this.data.page,"SUCCESS"); 
    },
    selected2:function(e){ // 货源
        this.setData({
            selected:false,
            selected1:false,
            selected2:true,
            page: 1,
            orderItems: [],  
            desireItem: [],
            scrollTop : 0                                             
        }); 
        this.getDesireFromServer(this.data.page);   
    },
    scroll:function(event){
        this.setData({
            scrollTop : event.detail.scrollTop
        });
    },    
    refresh: function (e) {
        let that = this;
        that.setData({
            orderItems: [], 
            desireItem: [],   
            scrollTop : 0,
            page: 1,
            totalNum: 0            
        });
        if(!!that.data.selected){
            that.getDataFromServer(that.data.page,"START");            
        }
        if(!!that.data.selected1){
            that.getDataFromServer(that.data.page,"SUCCESS");      
        }
        if(!!that.data.selected2){
            that.getDesireFromServer(that.data.page);      
        }  
    },  
    loadMore1: function () {
        let pageN = this.data.page+1;
        this.setData({ page: pageN });
        this.getDataFromServer(pageN,"START");
    }, 
    loadMore2: function () {
        let pageN = this.data.page+1;
        this.setData({ page: pageN });
        this.getDataFromServer( pageN ,"SUCCESS");
    },  
    loadMore3: function () {
        let pageN = this.data.page+1;
        this.setData({ page: pageN });
        this.getDesireFromServer(this.data.page,"SUCCESS")
    },         
    //获取网络数据的方法
    getDataFromServer: function (page,status) {
        let that = this;        
        let userInfo = that.data.userInfo;
        let totalNum = that.data.totalNum;
        
        if( !userInfo ){   
            app.goLog(); 
            return false;  
        }
        if( !!totalNum && page > totalNum ){
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
        let success = function(res){
            if( res.data.response_state == 1){
                let orderItems = res.data.list;
                let orderItem_arr = that.data.orderItems;
                if(!!orderItems[0]){
                    orderItems.forEach( ( item, i ) => {
                        item.dueDate = util.formatDate( new Date(item.dueDate) );
                        item.dueTime = util.formatDate3( new Date(item.dueTime) );
                    });
                    orderItem_arr = orderItem_arr.concat(orderItems);
                    that.setData({
                        totalNum: res.data.totalPage,                    
                        orderItems:  orderItem_arr
                    });      
                }
            }
            that.setData({
                loading: true, 
                hasMore: false
            }); 
        }
        let fail = function(){
            that.setData({
                loading: true, 
                hasMore: false
            });                                         
        }
        wx.request({
            url: URL + "mobile/order",
            data: {
                "pageSize": that.data.pageSize,
                "pageNum":page,
                "token" :  that.data.token,
                "status": status
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: success,
            fail: fail,
            complete: fail
        });
    }, 
    getDesireFromServer: function (page) {
        let that = this;
        let totalNum = that.data.totalNum;
        let userInfo = that.data.userInfo;
        
        if( !userInfo ){   
            app.goLog(); 
            return false;  
        }
        if( !!totalNum && page > totalNum ){
            wx.stopPullDownRefresh();
            app.showToastFn('没有数据');
            that.setData({
                loading: true, 
                hasMore: false
            });            
            return false;                    
        } 
        that.setData({
            loading: false,
            hasMore: true
        });
        let success = function(res){    
            wx.setStorageSync('desireItem',null);  
            let  totalPage = res.data.totalPage;
            let  pageNum =  res.data.pageNum;

            if( res.data.response_state == 1){
                let desireItem = res.data.list;
                let desireItem_arr =  that.data.desireItem;

                if(!!desireItem){
                    desireItem.forEach( ( item, i ) => {
                        console.log( item.dueTime  );

                        item.dueDate = util.formatDate( new Date(item.dueDate) );
                        item.dueTime = util.formatDate3( new Date(item.dueTime) );
                        console.log( item.dueTime  );

                    });
                    desireItem_arr = desireItem_arr.concat(desireItem);
                    that.setData({
                        totalNum: res.data.totalPage,                    
                        desireItem:  desireItem_arr
                    });
                    wx.setStorageSync('desireItem', desireItem_arr );  
                }
            }else{   
                app.showToastFn(res.data.response_note); 
            }
            that.setData({
                loading: true, 
                hasMore: false
            });  
        }
        let fail = function(){
            that.setData({
                loading: true, 
                hasMore: false
            });              
        }
        wx.request({
            url: URL + "mobile/desire",
            data: {
                "pageSize": that.data.pageSize,
                "pageNum": page,
                "token" : that.data.token,
                "status": "PAID"
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: success,
            fail: fail,
            complete: fail           
        })
    },
    goDesire: function(e){
        let id = e.currentTarget.dataset.id;

        wx.navigateTo({
          url: '../desire-detail/desire-detail?id='+id
        });
    },
    goOrder: function(e){
        let id = e.currentTarget.dataset.id; 
        let status = e.currentTarget.dataset.status; 

        wx.navigateTo({
          url: '../order-detail/order-detail?id='+id+'&status='+status
        })       
    },
    bindCancel: function(e){

        let id = e.currentTarget.dataset.id; 
        let that = this;

        wx.request({
          url: URL + 'mobile/desire/cancel',
          data: {
              token: that.data.token,
              id: id
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
             'content-type': "application/x-www-form-urlencoded"
          },
          success: function(res){
            if( res.data.response_state == 1 ){
                app.showToastFn( res.data.response_note );
                that.setData({
                    refund: true
                }); 
                that.refresh();
            } else{
                app.showToastFn( res.data.response_note );                 
            }    
          },
          fail: function() {
            app.showToastFn('取消订单失败');
          },
          complete: function() {
          }
        })
    },
    showMap: function(e){
        wx.openLocation({
            latitude: 30.208401,
            longitude: 120.16929,
            scale: 28
        });
    }   
})