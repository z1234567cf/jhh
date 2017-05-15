//app.js
App({
  onLaunch: function () {
    
    //调用API从本地缓存中获取数据
    let that = this;

    wx.login({ // 用户微信接口登录
      success: function(res) {
        let code = res.code;
        if (!!code) {
          //发起网络请求
          wx.request({
            url: that.globalData.http_url+'wxsr/login',
            method: 'GET', 
            data: {
              code:code
            },        
            success: function(res){
                if(res.data.response_state==-100){ // 没注册
                  that.globalData.userInfo = '';
                  that.globalData.hasUserInfo = false; 

                  wx.setStorageSync('wxId', res.data.wxOpenId );

                }else if(res.data.response_state == 1){ //登录成功

                  that.globalData.hasUserInfo = true;
                  that.globalData.userInfo = res.data;

                  wx.setStorageSync('userInfo', res.data);
                  wx.setStorageSync('wxId', res.data.wxOpenId ); 

                }else if( res.data.response_state == -1 ){
                  that.globalData.hasUserInfo = false;    
                  that.showToastFn('出错了，退出小程序并重新进入');
                }else{
                  that.showToastFn( res.data.response_note );                        
                }
                wx.setStorageSync('wxId', res.data.wxOpenId );  

                that.globalData.openId = res.data.wxOpenId;
            },
            fail: function(res) {
                  that.showToastFn('出错了，退出小程序并重新进入');
            }
          });
          wx.getUserInfo({ // 获取用户的微信信息
            success: function(res) {
              let user_data =  {
                encryptedData: res.encryptedData,
                signature:  res.signature,
                iv: res.iv
              }  
              that.globalData.hasWxUserInfo = true;
              that.globalData.wxUserInfo = res.userInfo;

              wx.setStorageSync('wxUserInfo', res.userInfo);
              wx.setStorageSync('user_data', user_data);
            }  
          });
        } else {
          that.showToastFn('出错了，退出小程序并重新进入');
        }
      }
    });
  }, 
  
  http_client_get: function(url,options,callback){

    let that = this;
    let data = options || {};
    
    wx.request({
      url: that.globalData.http_url + url,
      data: data,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        // success
        callback&&callback(res);
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  goLog: function(){
    var that = this;
    wx.showModal({
        title: '救援板车提醒您',
        content: '您的微信未绑定手机，现在去绑定',
        showCancel : true,
        success: function(res) {
            if (res.confirm) { // 用户前往登录
              wx.navigateTo({
                  url: '../logs/log',
                  success: function(res){
                      // success
                  },
                  fail: function() {
                      // fail
                      wx.showToast({
                      title: '登录页面躲起来了，请重试',
                      icon: 'success',
                      duration: 2000
                      })  
                      setTimeout(function(){
                      wx.hideToast()
                      },1000)                                                          
                  },
                  complete: function() {
                      // complete
                  }
              }) 
            }
        }
    })      
  },    
  showToastFn: function(str,callback){
    wx.showToast({
      title: str,
      duration: 800
    });   
    setTimeout(function(){
      wx.hideToast()
      callback&&callback();
    },1200)   
  },   
  checkLog: function(){
    let that= this;
    if(!that.globalData.hasUserInfo){ //检测是否登录
      that.goLog();  
    }
  },  
  globalData: {
    hasWxUserInfo: false,
    hasUserInfo :false,
    http_url : 'https://test.qtest.cc/haul/',
    imgSrc : "https://test.qtest.cc/haul/imag?uri=",
    userInfo: '',
    wxUserInfo: '',
    depart_photos: '',
    receipt_photos: '' ,
    hasReg: false,
    openId: ''
  }
})


