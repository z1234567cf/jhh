const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;
const app = getApp();
const URL = app.globalData.http_url;
const imgSrc = app.globalData.imgSrc;
const UTIL = require('../../util/util');

const MD5Util = require('../../util/md5'); 
const xml2json = require('../../util/xml2json');
    
Page({
    data: {
        winHeight:0,
        status: 'START',
        total: 0,
        earnest: 0,
        premium: 0,
        premiumPaid: false,
        balancePay: 0,
        orderNo: 0,
        obj: {},
        userInfo: '',
        roleType: '',
        token: '',
        wxOpenId: '',
        orderId: '',
        disabled: true
    },
    onShow: function( ){
        let that = this;
        let userInfo = app.globalData.userInfo;
        let roleType = userInfo.roleType;
        let token = userInfo.token;
        let wxOpenId = userInfo.wxOpenId;
        let orderId = wx.getStorageSync('orderId');
        
        that.setData({
            winHeight: winHeight,
             userInfo: userInfo,
             roleType: roleType,
             token: token,
             wxOpenId: wxOpenId,
             orderId: orderId,
             disabled: true
        });  

        wx.request({
          url: URL+"mobile/order/prePay",
          data: {
              token: that.data.token,
              orderId: orderId
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            // success
            let data =  res.data;                        
            if( res.data.response_state == 1 ){
                that.setData({
                    status: res.data.status,
                    total: res.data.total,
                    earnest: res.data.earnest,
                    premium: res.data.premium,
                    premiumPaid: res.data.premiumPaid,
                    balancePay: res.data.balancePay,
                    orderNo: res.data.orderNo
                });  
                that.setData({
                    disabled: false
                });    
            }else{
                app.showToastFn('获取订单价格失败,请刷新重试');
            }
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        });
    },
    bindPay: function(e){ // 支付
        let that = this;
        that.setData({
            disabled: true
        });    
        UTIL.unifiedOrder( that,function(obj){
            if(!!obj){
                let timeStamp =  (new Date()).valueOf() ;
                timeStamp = Math.round(timeStamp/1000);
                
                let sign = "";
                let signA = "appId="+obj.appid+"&nonceStr="+obj.nonce_str+"&package=prepay_id="+obj.prepay_id+"&signType=MD5&timeStamp="+timeStamp;
                let signB = signA+"&key=kinghanhong20160909sdgkdkkgdgkdk"; 
                sign = MD5Util.MD5(signB).toUpperCase();  

                wx.requestPayment({
                    appId: obj.appid,
                    nonceStr: obj.nonce_str, 
                    package: 'prepay_id='+ obj.prepay_id,                      
                    paySign: sign,                                     
                    signType: 'MD5',
                    timeStamp: ''+timeStamp,                  
                    success: function(res){
                        if( res.errMsg == 'requestPayment:ok'){
                            app.showToastFn('支付成功',function(){
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
                                })    
                            });  
                        }
                    },
                    complete: function(res) {
                        if( res.errMsg == 'requestPayment:fail cancel'){
                            app.showToastFn('您取消了支付');
                            that.setData({
                                disabled: false
                            });                            
                        }else if(res.errMsg == 'requestPayment:fail (detail message)'){
                            app.showToastFn('调用支付接口失败');   
                            that.setData({
                                disabled: false
                            });                                 
                        }
                    }
                }); 
            }else{
                that.setData({
                    disabled: false
                });                          
            }
        });
    }
});