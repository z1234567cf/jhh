const UTIL = require('../../util/util');
const bmap = require('../../util/bmap-wx.js');
const app = getApp();

Page({
  data: {
    winHeight: 0,
    cityList: [],
    city: "",
    sugData: [],
    place: '',
    curCity: '',
    curPlace: '',
    locations: []
  },
  onLoad: function (options) {
    let sysInfo = wx.getSystemInfoSync();
    let winHeight = sysInfo.windowHeight; 
    let curCity = '';

    this.setData({
      winHeight: winHeight,
      place: options.place,
    });
    console.log( this.data.place );
  },
  onShow : function(e){
    let that = this; 
    let BMap = new bmap.BMapWX({ 
      ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
    }); 
    let success = function(data) { 
      let curAddress = data.wxMarkerData[0].address;
      let curCity = data.originalData.result.addressComponent
      .city;
      wx.setStorageSync( 'curPlace', data.wxMarkerData[0] );
      that.setData({
        curCity: wx.getStorageSync('choseCity') || curCity,
        curPlace: data.wxMarkerData[0]
      }); 
      that.areaList();      
    } 
    BMap.regeocoding({ success: success}); 
  },
  areaList: function(){
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({ 
        ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
    }); 
    var success = function(data) { 
      let sugData = data.result;
      let sugArr = [];

      sugData.forEach( (item,i) => {
          if( i==0 ){
            item["province"] = item.city;
            item["city"] = item.name
          }
          if(!!item.location){
            sugArr.push( item );
          }
      });
      that.setData({ 
        sugData: sugArr
      }); 
    } 
    BMap.suggestion({ 
        query: that.data.curCity, 
        region: '全国', 
        success: success 
    });      
  },  
  bindSerch: function(e){
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({ 
        ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
    }); 
    var success = function(data) { 
      let sugData = data.result;
      let sugArr = []
      sugData.forEach( (item,i) => {
          if(!!item.location){
            sugArr.push( item );
          }
      });
      that.setData({ 
        sugData: sugArr
      }); 
    } 
    // 发起suggestion检索请求 
    BMap.suggestion({ 
        query: e.detail.value, 
        region: that.data.curCity, 
        city_limit: true, 
        success: success 
    });    
  },
  areaChosen: function(e){
    let id = e.currentTarget.dataset.id;
    let place = this.data.place;
    let place_list = this.data.sugData[id];
    let place_obj = {
      "city" : place_list.city,
      location: place_list.location
    }

    if( !place_list.district && (id == 0) ){
      place_obj["province"] = place_list.province;
      place_obj["onlyCity"] = true;
    }else{
      place_obj["district"] = place_list.district;    
      place_obj["name"] = place_list.name;     
      place_obj["onlyCity"] = false;                 
    }
    
    if(place=="start"){
      wx.setStorageSync('place_start', place_obj);
    }else if(place=="end"){
      wx.setStorageSync('place_end', place_obj ); 
    }
    wx.navigateBack({delta: 1})
  },
  onShareAppMessage: function () {
    return {
      title: '地址选择',
      path: '/page/area/area'
    }
  }    
});
