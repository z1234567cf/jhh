Page({
  data: {
      id : 0,
      instruct : {}
  }, 
  onLoad: function(options) {
    var that = this;

    wx.getStorage({
      key: 'instructions',
      success: function(res){
        // success
        let id = that.data.id;
        that.setData({
          instruct: res.data[id]
        })
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
    this.setData({
      id: options.id
    })
  }
})