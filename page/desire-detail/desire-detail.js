const UTIL = require('../../util/util');

Page({
    data:{
        desire: {},
        winHeight:0
    },
    onLoad:function(options){
        let that = this;
        let desireId = options.id;
        let sysInfo = wx.getSystemInfoSync();
        let winHeight = sysInfo.windowHeight;

        that.setData({
            winHeight: winHeight
        });

        let desireList = wx.getStorageSync('desireItem');
        desireList.forEach( ( item, i ) => {
            if(item.id==desireId){
                that.setData({
                    desire: item
                });
            }
        });
    }
});