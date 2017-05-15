const app = getApp();
const URL = app.globalData.http_url;
const imgSrc = app.globalData.imgSrc;
const UTIL = require('../../util/util');
const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;

Page({
    data: {
        orderItem:{},
        status: "",
        winHeight:0,
        driverTf: true,
        manager_driver: false,
        driverInfo: {},
        depart_photos: [],
        receipt_photos: [],
        orderId: 0,
        userInfo: '',
        roleName: '',
        token: '',
        finish: false, 
        userId: '' 
    },
    onLoad:function(options){
        let id = options.id;
        let status = options.status;        
        let that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let roleName = userInfo.roleName;
        let token = userInfo.token;

        that.setData({
            orderId : id,
            winHeight: winHeight,
            userInfo: userInfo,
            roleName: roleName,
            token: token,
            status: status,
            userId: userInfo.id
        });
        wx.setStorageSync('orderId', id);     
    },
    onShow: function(options){
        let that = this;
        let success = function(res){
            if( res.data.response_state == 1){
                let orderItem = res.data;

                orderItem["dueDate"] = UTIL.formatDate( new Date(orderItem.dueDate) );
                orderItem["dueTime"] = UTIL.formatDate3( new Date(orderItem.dueTime) );

                that.setData({
                    orderItem: orderItem
                });
                
                let driverInfo = res.data.driver;
                if( !!driverInfo.photo){
                  driverInfo['photo'] = imgSrc + driverInfo.photo;
                    that.setData({
                        driverInfo: driverInfo
                    });                    
                }
                that.setData({
                    driverInfo: driverInfo
                });                  
                let departInspection = that.data.orderItem.departInspection;
                let depart_photos = [];
                if(!!departInspection){
                    depart_photos = departInspection.loadPhotos;
                    if(!!depart_photos){
                        let depart_photos_array = depart_photos.map(function (item) {
                            return imgSrc+ item;
                        });
                        that.setData({
                            depart_photos: depart_photos_array
                        });                  
                    }
                }
                let receiptInspection = that.data.orderItem.receiptInspection;
                let receipt_photos = [];
                if(!!receiptInspection){   
                    receipt_photos = receiptInspection.loadPhotos; 
                    if(!!receipt_photos){
                        let receipt_photos_array = receipt_photos.map(function(item) {
                            return imgSrc+ item
                        });
                        that.setData({
                            receipt_photos: receipt_photos_array
                        });  
                    }
                }

                if( that.data.roleName == "ROLE_DRIVER"){ // 是否是司机
                    that.setData({
                        driverTf: true
                    });
                }else{
                    that.setData({
                        driverTf: false
                    });                
                }

                let customerId = res.data.customerId;
                let userId =  that.data.userInfo.id;

                if( !!customerId &&  (customerId!==userId) ){ // 是调度下的司机
                    that.setData({
                        manager_driver: true,
                        finish : false                        
                    });
                }
                
                if( that.data.status == 'START'){
                    if( that.data.roleName == "ROLE_CUSTOMER" ){
                        that.setData({
                            finish : true
                        })                      
                    }else if( !!customerId && (customerId == userId) ){
                        that.setData({
                            finish : true
                        });    
                    }
                }
            }else{
                app.showToastFn('网络有问题，请刷新重试');
            }
       }
        wx.request({ // 请求订单详细信息
          url: URL+'mobile/order/'+that.data.orderId,
          data: {
              token: that.data.token
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          success: success,
          fail: function() {
            // fail
            app.showToastFn('请求失败');            
          },
          complete: function() {
            // complete
          }
        });
    },
    bindComplete: function(e){ // 完成订单
        wx.redirectTo({
          url: '../pay-all/pay-all',
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
    }
});