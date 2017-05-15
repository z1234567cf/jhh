var app = getApp();
const sysInfo = wx.getSystemInfoSync();
const winHeight = sysInfo.windowHeight;

const imgSrc = app.globalData.imgSrc; 
const URL = app.globalData.http_url;

Page({
    data: {
        wxUserInfo: '',
        hasWxUserInfo: false,
        person_data : {},
        cs_id: '',
        winHeight: 0,
        token: '',
        userInfo: '',
        cs_username: '',
        hasLog: false
    },
    onLoad: function(){
        let that = this;
        this.setData({
            winHeight: winHeight,
            wxUserInfo: app.globalData.wxUserInfo
        });
        if( !that.data.hasLog){ // 如果没有登录
            that.setData({
                token: '',
                cs_id: '',
                cs_username: '',
                userInfo: ''
            });
        }  
    },
    onShow: function(){
        this.refresh();
    },
    refresh: function(){

        let that = this;
        let userInfo = wx.getStorageSync('userInfo');  
        if(!userInfo){
            that.setData({
                token: '',
                cs_id: '',
                cs_username: '',
                userInfo: '',
                hasLog: false                    
            });
        }else{
            let token = userInfo.token;  

            if( !userInfo.photo ){
                userInfo['photo'] = "";
            }else{
                let tempValue;
                tempValue = userInfo.photo;
                let pos1 = tempValue.lastIndexOf(".");
                let v = tempValue.substring(pos1+1,tempValue.length);

                if( pos1 !== -1 ){
                    if(v!="gif"&&v!="jpg"&&v!="jpeg"&&v!="bmp"){
                        userInfo['photo'] = "";
                    }else{
                        if( !!userInfo.photo ){
                            userInfo['photo'] = imgSrc + userInfo['photo'];
                        }
                    }   
                }
            }

            that.setData({
                hasLog: true,
                token: token,
                hasWxUserInfo: app.globalData.hasWxUserInfo,
                cs_id : wx.getStorageSync('cs_id'),
                cs_username:  wx.getStorageSync('cs_username') || '400-100-5116',
                userInfo: userInfo
            }); 

            app.http_client_get('mobile/user/getInfo',{'token':that.data.token},function(res){
                that.data.person_data = res.data;
                wx.setStorageSync('person_data', res.data);
            });                                
        } 
    },
    makeCell: function(e){ //拨打客服电话
        wx.makePhoneCall({
          phoneNumber: this.data.cs_username,
          success: function(res) {
          }
        })
    },
    logout: function(e){
        let that = this;
        wx.request({
          url: URL+'mobile/logout',
          data: {
             token: that.data.token
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {"Content-Type": "application/x-www-form-urlencoded"}, // 设置请求的 header
          success: function(res){
            if( res.data.response_state==1){
                wx.clearStorage();
                that.setData({
                    hasLog: false
                });
                that.onLoad();
                app.showToastFn('退出成功');                            
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
    logIn: function(){
        let that = this;
        if( !that.data.token ){
            app.goLog();
           return false;
        }else{
            app.showToastFn('您已经登录啦');
        }        
    }
});