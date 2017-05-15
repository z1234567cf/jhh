var app = getApp();

Page({
  data: {
    pickerHidden: true,
    userName: '',  
    wxId: '',
    items: [
      {name: 'ROLE_CUSTOMER', value: '客户', checked:true},
      {name: 'ROLE_DRIVER', value: '司机', checked: false},
    ],
    cs_array: [],
    cs_id: '',
    role_role: 'ROLE_CUSTOMER'
  },
  onLoad: function(options) {
    let that = this;
    try {
      var value = wx.getStorageSync('wxId');
      if (value) {
        that.setData({
          wxId: value
        })      
      }
    } catch (e) {
    }

    wx.request({
      url: app.globalData.http_url+'mobile/user/cs',
      data: {},
      method: 'GET', 
      success: function(res){
        if (res.data.response_state == 1) {
          that.setData({
            cs_array: res.data.list
          });
        }
      },
      fail: function() {
        console.log("失败");
      }
    })

  },  
  setNaivgationBarTitle: function (e) {
    var title = e.detail.value.title
    wx.setNavigationBarTitle({
      title: title
    })
  },  
  radioChange: function(e) {
    switch (e.detail.value) {
      case 'ROLE_CUSTOMER':
        this.setData({items:[
          {name: 'ROLE_CUSTOMER', value: '客户', checked: 'true'},
          {name: 'ROLE_DRIVER', value: '司机', checked: ''},        
        ]});
        break;
      case 'ROLE_DRIVER':
        this.setData({items:[
          {name: 'ROLE_CUSTOMER', value: '客户', checked: ''},
          {name: 'ROLE_DRIVER', value: '司机', checked: 'true'},        
        ]});  
        break;                          
    }
    this.setData({
      role_role: e.detail.value
    });
    console.log( this.data.role_role);
  },
  changeUser: function(e){
   var value = e.detail.value;
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
          app.showToastFn('获取验证码失败');
      }
    })   
  },
  bindPickerChange: function(e){
    let that = this;    
    that.setData({
      cs_id: that.data.cs_array[e.detail.value].id,
      cs_username:  that.data.cs_array[e.detail.value].username,
      cs_nickname:  that.data.cs_array[e.detail.value].nickname
    })
    wx.setStorageSync('cs_id', that.data.cs_id);
    wx.setStorageSync('cs_username', that.data.cs_username);   
  },
  formSubmit: function(e) {

    let form_object = e.detail.value;
    let that = this;



    if(!(form_object['password'])){
      app.showToastFn('请输入密码');    
      return false;         
    }

    if(form_object['password']!==form_object['repassword']){
      app.showToastFn('两次的密码必须一致');          
      return false;         
    }

    var data={
        "username": form_object["username"],
        "password": form_object["password"],    
        "verificationCode": form_object["verificationCode"],
        "role": form_object["role"],   
        "csId": that.data.cs_id,
        "wxOpenId": that.data.wxId   
    }

    wx.request({
      url: app.globalData.http_url+"mobile/register",
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res){
        if(res.data.response_state == 1){

          app.showToastFn('注册成功',function(){

            app.globalData.hasLogin = true;
            app.globalData.hasUserInfo = true; 
            app.globalData.userInfo =  res.data;
            app.globalData.hasReg = true;

            wx.setStorageSync('userInfo', res.data);
       
            wx.navigateBack({  // 返回到登录
              delta: 2, // 回退前 delta(默认为1) 页面
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
          app.showToastFn( res.data.response_note );          
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
  formReset: function(e) {
    this.setData({
      cs_id: ''
    })
  },
  onShareAppMessage: function () {
      return {
      title: '注册页面',
      path: '/page/register/register'
      }
  }       
})
