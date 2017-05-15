const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;
const app = getApp();
const URL = app.globalData.http_url;
const UTIL = require('../../util/util');
const MD5Util = require('../../util/md5'); 
const imgSrc = app.globalData.imgSrc;

Page({
    data: {
       winHeight : 0,
       totalFee : 0,
       outTradeNo : "",
        userInfo : '',
        token : '',
        disabled: true
    },
    onLoad: function(options){
        let that = this;
        let earnest = options.earnest;
        let desireNo = options.desireNo;
        let userInfo = wx.getStorageSync('userInfo');
        let token = userInfo.token;     

        that.setData({
            userInfo: userInfo,
            winHeight: winHeight,
            totalFee : earnest,
            outTradeNo : desireNo,
            token: token,
            disabled: false
        });
    },
    bindPay: function(e){
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
                        if( res.errMsg == "requestPayment:ok"){    
                            app.showToastFn('付款成功',function(){

                                wx.setStorageSync('place_start','');
                                wx.setStorageSync('place_end', ''); 
                                wx.setStorageSync('price', '');
                                                                       
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
                        }else{
                            that.setData({
                                disabled: false
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
                app.showToastFn('付款失败');
                that.setData({
                    disabled: false
                });                   
            }
        });
    }
});