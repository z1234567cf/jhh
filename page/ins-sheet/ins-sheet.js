const app = getApp();
const URL = app.globalData.http_url;
const imgSrc = app.globalData.imgSrc;

Page({
    data: {
        winHeight: 0,
        sheet:{},
        loadPhotos: [],
        up_image: [],
        ins_type: "",
        prev_image: [],
        note: "请输入留言",
        subTrue: false
    },
    onLoad: function(options){
        let that = this;
        let ins_type = options.type;
        let SystemInfo = wx.getSystemInfoSync();
       
        that.setData({
            winHeight: SystemInfo.windowHeight,
            up_image: [],
            prev_image: []
        });

        if(ins_type == 'depart'){
           ins_type = 'DEPART';
            wx.setNavigationBarTitle({
              title: '发车验货单',
              success: function(res) {
                // success
              }
            });
        }else if(ins_type == 'receipt'){
            ins_type = 'RECEIPT';
            wx.setNavigationBarTitle({
              title: '收车验货单',
              success: function(res) {
                // success
              }
            });   
        }

        that.setData({
            ins_type: ins_type
        });
        let orderId = wx.getStorageSync('orderId');
        let userInfo = wx.getStorageSync('userInfo');
        let token = userInfo.token;

        wx.request({
          url: URL+'mobile/order/inspection',
          data: {
              token : token,
              orderId : orderId,
                type : ins_type
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            if(res.data.response_state == 1){ 
                let loadPhotos = res.data.loadPhotos;
                let note = res.data.note;

                if(!!loadPhotos){
                    loadPhotos = loadPhotos.map(function (item) {
                        if(item){
                            return imgSrc+ item;
                        }else{
                            return;
                        }
                    });
                }

                if(!!note){
                    that.setData({
                      note: note  
                    });
                }
                that.setData({ //获取已有的图片
                    loadPhotos: loadPhotos
                });   
            }else{
                app.showToastFn('网络不稳定,请刷新页面重试');
            }
          },
          fail: function() {
                app.showToastFn('获取信息失败了,请刷新页面重试');
          },
          complete: function() {
            // complete
          }
        });
    },
    onShow: function(){
        this.setData({subTrue:true});
    },
    choseImg: function(e){
        let that = this;
        let index = parseInt(e.currentTarget.dataset.index);
        // 当前预览图片
        let prev_image = that.data.prev_image;
        let loadPhotos = that.data.loadPhotos;

        if( !!loadPhotos && !!loadPhotos[index] ){
            return false;
        }else{
            wx.chooseImage({
                count: 1, // 默认9
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    let tempFilePath = res.tempFilePaths[0];
                    prev_image[index] = tempFilePath;
                    
                    wx.uploadFile({
                        url: URL+'upload', 
                        filePath: tempFilePath,
                        name: 'file',
                        formData:{},
                        success: function(res){
                            let data = res.data;
                            let imgData = JSON.parse(data).uri[0];
                            let up_image = that.data.up_image;

                            up_image[index] = imgData;
                            that.setData({
                                up_image: up_image,
                                prev_image : prev_image
                            });
                        }
                    })

                }
            });
        }    
    },
    bindFormSubmit: function(e){
        let that = this;

        if( that.data.subTrue){
            that.setData({subTrue:false});

            let orderId = wx.getStorageSync('orderId');
            let ins_type = this.data.ins_type;
            let userInfo = wx.getStorageSync('userInfo');
            let note = e.detail.value.note;
            let data = {
                token: userInfo.token,
                orderId: orderId,
                type: ins_type,
                note: note
            };  
            let up_images = that.data.up_image;
            let index = 0;

            up_images.forEach( ( item, i ) => {
                if( !!item){
                    data["loadPhotos["+index+"]"] = item
                    index++;
                }
            });

            console.log('------upload--------');
            wx.request({ // 上传图片文件
                url: URL+'mobile/order/inspection',
                data: data,
                header: {
                    'content-type': "application/x-www-form-urlencoded"
                },
                method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                success: function(res){
                    if( res.data.response_state == 1){
                        app.showToastFn('上传成功',function(){

                            wx.navigateBack({
                            delta: 1, // 回退前 delta(默认为1) 页面
                            success: function(res){
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
                        app.showToastFn('上传失败，请重新尝试');
                    }
                }
            });

        }
    }
});