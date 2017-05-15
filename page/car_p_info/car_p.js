Page({
  data: {
      con_arr : [
          {
            'info':'发车人信息',
            'phone':'发车人电话',
            'place_info': '请输入发车人姓名',
            'place_phone': '请输入发车人电话',
            'place_name': 'shipperName',
            'place_mobile': 'shipperPhone'              
          },
          {
            'info':'接车人信息',
            'phone':'接车人电话',  
            'place_info': '请输入接车人姓名',
            'place_phone': '请输入接车人电话',   
            'place_name': 'receiverName',
            'place_mobile': 'receiverPhone'                                           
          }
      ],
      mode: '',
      index_num: 0
  }, 
  formSubmit2: function(e) {

    let form_object = e.detail.value;
    let mode = this.data.mode;

    console.log(form_object);

    if(mode == 'receive'){
      wx.setStorage({
        key: 'car_receiver',
        data: form_object,
        success: function(res){
          // success
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

        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    }else{
      wx.setStorage({
        key: 'car_send',
        data: form_object,
        success: function(res){
          // success
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

        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })      
    }
  }, 
  onLoad: function(options) {
    let that = this;

    that.setData({
      mode: options.mode
    });

    let mode = that.data.mode; 

    if(mode == 'receive'){
        that.setData({
            index_num: 0
        });
    }else if(mode == 'send'){
        that.setData({
            index_num: 1
        });
    }
  }   
});