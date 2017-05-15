const app = getApp();
const URL = app.globalData.http_url;

Page({
  data: {
    userName: '',
    openId: ''
  },
  onShow: function(){
    let that= this;
    this.setData({
      openId: app.globalData.openId
    });
  },
  setNaivgationBarTitle: function (e) {
    let title = e.detail.value.title;

    wx.setNavigationBarTitle({
      title: title
    });
  },     
  changeUser: function(e){
    let value = e.detail.value;

    this.setData({
      userName: value
    })   
  },  
  getYzm: function(e){
    var userName = this.data.userName;
    if(!userName){
      app.showToastFn('电话号码不能为空');    
      return false;   
    }
    if(!(/^1(3|4|5|7|8)\d{9}$/.test(userName))){ 
      app.showToastFn('请输入正确的电话号码');       
      return false;     
    }

    wx.request({ 
      url: app.globalData.http_url+'mobile/verficationCode',
      data: {
        mobile: userName,
      },
      method: 'GET',
      success: function (res) {
        if( res.data.response_state == 1){
          app.showToastFn('验证码已发送到您的手机，请注意查收'); 
        }else{
          app.showToastFn(res.data.response_note);              
        }             
      },
      fail: function (res) {
        app.showToastFn('验证码发送失败，请您重新尝试');            
      }
    })   
  },
  formSubmit_log: function(e) {
    let form_object = e.detail.value;
    let that = this;

    var data= {
        "mobile": form_object["mobile"],
        "verificationCode": form_object["verificationCode"],
        "openid": that.data.openId       
    }

    wx.request({
      url: app.globalData.http_url+"wxsr/loginByMobile",
      data:data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
        if(res.data.response_state == 1){
            app.showToastFn('登录成功,下次可以直接登录',function(){
                app.globalData.hasUserInfo = true;
                app.globalData.userInfo =  res.data;
                wx.setStorageSync('userInfo',  res.data);
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
        }else if(res.data.response_state == -100){
            wx.showModal({
                title: '救援板车提醒您',
                content: '您还未在我们平台上注册，请前往注册',
                showCancel : false,
                success: function(res) {
                    if (res.confirm) { // 用户前往注册
                        wx.navigateTo({
                            url: '../register/register',
                            success: function(res){
                              // success
                            },
                            fail: function() {
                            // fail
                              that.globalData.showToastFn('注册页面躲起来了，请重试');                     
                            },
                            complete: function() {
                            // complete
                            }
                        }) 
                    }
                }
            })
        }else{
          app.showToastFn('出错了'+res.data.response_note);       
        }
      },
      fail: function() {
        // fail
        console.log("失败了");
      },
      complete: function() {
        // complete
      }
    });
  },
  formReset_log: function(e) {
    this.setData({
      cs_id: ''
    })
  },
  onShareAppMessage: function () {
      return {
      title: '登录页面',
      path: '/page/logs/log'
      }
  }       
})
