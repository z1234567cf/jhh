const UTIL = require('../../util/util');
const bmap = require('../../util/bmap-wx.js');

const app = getApp();
const URL = app.globalData.http_url;
const imgSrc = app.imgSrc;

Page({
    data: {
        date: UTIL.formatDate(new Date()),
        add_ins: false,
        chassis_img: '',
        needSpecialTrailer : false,
        sugData: [],
        place_s:'',
        place_e:'',
        place_c: '',
        location_s: '',
        location_e: '',
        distance: 0,
        price: 0,
        prevImg: '',
        company: '',
        needPay: false,
        switchTf: false,
        userInfo: '',
        token: '',
        routeType: '',
        managerT: false,
        fromProvince: '',
        fromCity: '',
        fromDist: '',
        fromName: '',
        toProvince: '',
        toCity: '',
        toDist: '',
        toName: '',        
        ps_city: false,
        pe_city:false       
    },
    onLoad: function(){
        let that = this;  // 新建百度地图对象 
        let userInfo = wx.getStorageSync('userInfo');
        let token = userInfo.token;
        let roleName = userInfo.roleName;

        if(roleName == 'ROLE_MANAGER'){
            that.setData({
               managerT: true 
            });
        }
        that.setData({
            userInfo: userInfo,
            token: token,
            place_s: '',
            place_c: '',
            place_e: '',
            location_s: '',
            location_e: ''
        });
        wx.removeStorageSync('choseCity');
        wx.removeStorageSync('place_start');
        wx.removeStorageSync('place_end');  
        this.needPayFn(); 
    },
    getCurCity: function(callback){
        let that = this;
        let BMap = new bmap.BMapWX({ 
            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
        }); 
        let success = function(data) { 
            let address = data.originalData.result.addressComponent;
            let location = data.originalData.result.location;
            let province = address.province;
            let city = address.city || '';
            let district = address.district || '';
            let street = address.street || '';
            let street_number = address.street_number || ''

            if( !!location.lat && !!location.lng ){
                let place_c = {
                    province: province,
                    city: city,
                    district: district,
                    name: street+street_number,
                    location: {
                        lat: location.lat,
                        lng: location.lng
                    }
                }

                that.setData({
                    place_c: place_c
                }); 
            }
            callback&&callback();
        }
        BMap.regeocoding({ success: success});    
    },
    needPayFn: function(){
        let that=this;
        wx.request({
          url: URL+'mobile/desire/payCheck',
          data: {
             token: that.data.token
          },
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            // success
            if(res.data.response_state == 1){
                that.setData({
                    needPay: res.data.needPay
                });
            }else{
                app.showToastFn('网络请求出错，请刷新重试');
            }
          }
        });        
    },
    onShow: function(){
        let that = this;
        let location_s = '';
        let location_e = '';
        let place_s = wx.getStorageSync('place_start');
        let userInfo = wx.getStorageSync('userInfo');
        let roleName = userInfo.roleName;

        if(!place_s && roleName == 'ROLE_MANAGER'){ // 是调度
            that.getCurCity(function(){
                that.initDisFn(that.data.place_c);
            });
        }else{
            that.initDisFn(place_s);         
        }
    }, 
    initDisFn: function( place_s , isCur){ //isCur 为真 是定位 只传经纬度
        let that = this;
        let place_e = wx.getStorageSync('place_end');

        let BMap = new bmap.BMapWX({ 
            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
        });
        let data = {
            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl',
            output: 'json',
            mode: 'driving'
        };

        if( !!place_s ){
            let place_s_p = '';
            let place_s_d ='';
            let place_s_n ='';
            let place_s_c = place_s.city || '';
            let loc_s_lat =  Number(place_s.location.lat).toFixed(6);
            let loc_s_lng =  Number(place_s.location.lng).toFixed(6);

            let successFn1 = function(res){
                that.setData({
                    fromProvince: res.data.result.addressComponent.province,
                    ps_city: false,
                    fromCity: place_s_c,
                    fromDist: place_s_d,
                    fromName: place_s_n
                });
            }

            if( !!place_s.onlyCity ){
                place_s_p = place_s.province || '';
                that.setData({
                    ps_city: true,
                    fromCity: place_s_c,
                    fromProvince: place_s_p
                })                
            }else{
                place_s_d = place_s.district|| '';
                place_s_n = place_s.name || '';
                if(!!loc_s_lat && !!loc_s_lng){
                    wx.request({
                        url: 'https://api.map.baidu.com/geocoder/v2/',
                        data: {
                            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl',
                            location: loc_s_lat+","+ loc_s_lng,         
                            output: 'json'
                        },
                        success: successFn1
                    });
                }                
            }   
            that.setData({
                place_s: place_s_p+place_s_c+place_s_d+''+place_s_n || '请选择起始位置',
                location_s: {
                    lat : Number(place_s.location.lat),
                    lng : Number(place_s.location.lng)
                }
            });  
            data['origin_region'] = place_s.city;                 
            data['origin'] =loc_s_lat +"," + loc_s_lng;                 
        }

        if(!!place_e){
            let place_e_p = '';
            let place_e_d ='';
            let place_e_n ='';
            let place_e_c = place_e.city || '';
            let loc_e_lat =  Number(place_e.location.lat).toFixed(6);
            let loc_e_lng =  Number(place_e.location.lng).toFixed(6);

            let successFn2= function(res){
                that.setData({
                    fromProvince: res.data.result.addressComponent.province,
                    pe_city: false,
                    toCity: place_e_c,
                    toDist: place_e_d,
                    toName: place_e_n
                });
            }

            if( !!place_e.onlyCity ){
                place_e_p = place_e.province || '';
                that.setData({
                    pe_city: true,
                    toCity: place_e_c,
                    toProvince: place_e_p
                })                   
            }else{
                place_e_d = place_e.district|| '';
                place_e_n = place_e.name || '';  
                if(!!loc_e_lat && !!loc_e_lng){
                    wx.request({
                        url: 'https://api.map.baidu.com/geocoder/v2/',
                        data: {
                            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl',
                            location: loc_e_lat+","+ loc_e_lng,         
                            output: 'json'
                        },
                        success: successFn2
                    });
                }           
            }
            that.setData({
                place_e: place_e_p+place_e_c+''+place_e_d+''+place_e_n || '请选择结束位置' ,
                location_e: {
                    lat : Number(place_e.location.lat),
                    lng : Number(place_e.location.lng)
                }    
            });    
            data['destination_region'] = place_e.city;    
            data['destination'] = that.data.location_e.lat.toFixed(6) + "," + that.data.location_e.lng.toFixed(6);    
        }
        let successFn = function(res){
            if( res.data.response_state == -1){
                app.showToastFn('出错啦,刷新重试');
                return false;
            }
            let price = res.data;
            wx.setStorageSync('price', price); 
            let routeType = that.data.routeType;
            if( !!routeType ){ 
                that.checkFn(routeType, price);
            }
        }

        let success = function(res){   // 计算距离成功 请求价格
            let distance = res.data.result.routes[0].distance;
            that.setData({
                distance : Math.round( distance/1000 ) 
            });   
            wx.request({
                url: app.globalData.http_url + 'mobile/desire/valuation',
                data: {
                    token: that.data.token,
                    distance: that.data.distance
                },
                method: 'GET', 
                success: successFn
            });                     
        }

        if(!!that.data.location_e && !!that.data.location_s){
            wx.request({ // 计算距离
                url: 'https://api.map.baidu.com/direction/v1',
                data: data,
                method: 'GET', 
                success: success
            }); 
        }else{
            that.setData({
                distance : 0
            });
        }
    },    
    bindDateChange: function(e) {
        this.setData({
            date: e.detail.value
        });
    },
    bindSerch: function(e){
        var that = this;
        if (e.detail.value === '') {
            that.setData({
                sugData: ''
            });
            return;
        }
        // 新建百度地图对象 
        var BMap = new bmap.BMapWX({ 
            ak: 'IOS3Ew6Xk4r4XM63ACv5YjNl' 
        }); 
        var success = function(data) { 
            var sugData = []; 
            for(var i = 0; i < data.result.length; i++) { 
                sugData.push( data.result[i].city ); 
            } 
            that.setData({ 
                sugData: sugData 
            }); 
        } 
       // 发起suggestion检索请求 
        BMap.suggestion({ 
            query: e.detail.value, 
            region: '全国', 
            city_limit: false, 
            success: success 
        }); 
    },   
    bindTimeChange: function(){
        let switchTf = this.data.switchTf;
        this.setData({  // 11:00:00
            switchTf: !switchTf
        });
    },
    add_insurance: function(e){
        let that = this;
        that.setData({
            add_ins: !that.data.add_ins
        });
    },
    radioChange: function(e){
        let that = this;
        let routeType = e.detail.value;
        let price = wx.getStorageSync('price');
        this.setData({
            routeType: routeType
        });
        this.checkFn(routeType,price);
    }, 
    checkboxChange: function(e){
        this.setData({
          needSpecialTrailer: !this.data.needSpecialTrailer
        });
        let managerT = this.data.managerT;
        if(!managerT){ // 不是调度
            let routeType = this.data.routeType;
            let price = wx.getStorageSync('price');
            this.checkFn(routeType, price);
        }
    },   
    checkFn: function(routeType, price){
         let cost = 0;
        if( this.data.needSpecialTrailer ){ // 特殊车型
            if( routeType == 'SINGLE'){
                cost = price.singleSpecial;
            }else if( routeType == 'RETURN'){
                cost = price.returnSpecial;
            }            
        }else{
            if( routeType == 'SINGLE'){
                cost = price.singlePrice;
            }else if( routeType == 'RETURN'){
                cost = price.returnPrice;
            }    
        }
        this.setData({
            price : cost 
        });
    }, 
    up_image: function(e){ // 上传图片
        let that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
                let tempFilePath = res.tempFilePaths[0];
                let prevImg = tempFilePath;
                wx.uploadFile({
                    url: URL+'upload',
                    filePath: tempFilePath,
                    name: 'file',
                    formData:{},
                    success: function(res){
                        let data = res.data;
                        that.setData({
                            chassis_img: JSON.parse(data).uri[0],
                            prevImg: prevImg 
                        });
                    }
                })
            }
        });
    }, 
    formSubmit: function(e){
        let that = this;
        let upload_obj = e.detail.value;
        let ps_city = that.data.ps_city;
        let pe_city = that.data.pe_city;
        let location_s = that.data.location_s;
        let location_e = that.data.location_e;

        let from_lat = Number(location_s['lat']);
        let from_lon = Number(location_s['lng']);
        let to_lat = Number(location_e['lat']);
        let to_lon = Number(location_e['lng']);

        let carModel = upload_obj['carModel'];
        let carInsurance =  upload_obj['carInsurance'];
        let shipperName = upload_obj['shipperName'];
        let receiverName = upload_obj['receiverName'];   
        let shipperPhone = upload_obj['shipperPhone'];
        let receiverPhone = upload_obj['receiverPhone'];  
        let managerT = this.data.managerT;

        let fromProvince = this.data.fromProvince;
        let fromCity =  this.data.fromCity;
        let toProvince = this.data.toProvince;
        let toCity =  this.data.toCity;

        if(!!ps_city){
            upload_obj['from.province'] = fromProvince;
            upload_obj['from.city'] = fromCity;
        }else{
            upload_obj["from.lat"] = from_lat;
            upload_obj["from.lon"] = from_lon;    
        }

        if(!!pe_city){
            upload_obj['to.province'] = toProvince;
            upload_obj['to.city'] = toCity;
        }else{
            upload_obj["to.lat"] = to_lat;
            upload_obj["to.lon"] = to_lon;  
        }

        upload_obj["needSpecialTrailer"] = !!upload_obj["needSpecialTrailer"][0];
        if(managerT){  // 是调度
            if( !from_lat){
                app.showToastFn('请选择开始位置');            
            }else if( !to_lat ){
                app.showToastFn('请选择结束位置');
            }else if( from_lat == to_lat && from_lon == to_lon){
                app.showToastFn('起始结束位置不能相同'); 
            }else if(!carModel){
                app.showToastFn('请输入车型');
            }else if( !!carInsurance && !!isNaN(carInsurance) ){
                app.showToastFn('保险金额必须为数字');
            }else{
                if(!upload_obj['estimateFee']){  
                    app.showToastFn('请输入订单总额');
                }else if( !!isNaN( upload_obj['estimateFee'] ) ){ 
                    app.showToastFn('订单总额必须为数字');
                }else if(!shipperName ){       
                    app.showToastFn('请输入发车人姓名'); 
                }else if(!shipperPhone){         
                    app.showToastFn('请输入发车人电话'); 
                }else if( !(/^1(3|4|5|7|8)\d{9}$/.test(shipperPhone))){         
                    app.showToastFn('发车人电话号码有误');
                }else if(!receiverName){            
                    app.showToastFn('请输入接车人姓名');    
                }else if( !receiverPhone ){            
                    app.showToastFn('请输入接车人电话');
                }else if(!(/^1(3|4|5|7|8)\d{9}$/.test(receiverPhone))){ 
                    app.showToastFn('接车人电话号码有误');
                }else{
                    if( !upload_obj['validHour'] ){
                        upload_obj['validHour'] = 48
                    }
                    upload_obj['token'] =that.data.token;
                    upload_obj['estimateFee'] = Math.round( upload_obj['estimateFee'] );
                    upload_obj['dueDate'] = that.data.date;
                    upload_obj['distance'] = that.data.distance;
                    that.req(upload_obj);  
                }
            } 
        }else{  // 不是调度
            if( !from_lat){
                app.showToastFn('请选择开始位置');            
            }else if( !to_lat ){
                app.showToastFn('请选择结束位置');
            }else if( (from_lat == to_lat) && (from_lon == to_lon)){
                app.showToastFn('起始结束位置不能相同'); 
            }else if(!carModel){
                app.showToastFn('请输入车型');
            }else if( !!carInsurance && !!isNaN(carInsurance) ){
                app.showToastFn('保险金额必须为数字');
            }else{
                
                if(!that.data.price){  
                    app.showToastFn('请选择是单程回程还是特殊车型');
                }else if(!shipperName ){       
                    app.showToastFn('请输入发车人姓名'); 
                }else if(!shipperPhone){         
                    app.showToastFn('请输入发车人电话'); 
                }else if( !(/^1(3|4|5|7|8)\d{9}$/.test(shipperPhone))){         
                    app.showToastFn('发车人电话号码有误');
                }else if(!receiverName){            
                    app.showToastFn('请输入接车人姓名');    
                }else if( !receiverPhone ){            
                    app.showToastFn('请输入接车人电话');
                }else if(!(/^1(3|4|5|7|8)\d{9}$/.test(receiverPhone))){ 
                    app.showToastFn('接车人电话号码有误');
                }else{
                    if( !upload_obj['validHour'] ){
                        upload_obj['validHour'] = 48
                    }
                    upload_obj['token'] =that.data.token;
                    upload_obj['estimateFee'] = that.data.price;
                    upload_obj['dueDate'] = that.data.date;
                    upload_obj['distance'] = that.data.distance;
                    upload_obj['routeType'] = that.data.routeType;

                    console.log( upload_obj );
                    that.req(upload_obj);     
                }
            } 
        }
    },
    req: function(upload_obj){
        let that = this;
        let success = function(res){
            let desireNo = res.data.desireNo; 
            let earnest = res.data.earnest;

            if( res.data.response_state == 1){     
                if( that.data.needPay ){ // 需要支付的话
                    wx.redirectTo({
                        url: '../pay-earnest/pay-earnest?desireNo='+desireNo+'&earnest='+earnest
                    });
                }else{
                    app.showToastFn('发布成功',function(){
                        wx.setStorageSync('place_start','');
                        wx.setStorageSync('place_end', '');     
                        wx.setStorageSync('price', '')                   
                        wx.navigateBack({delta: 1})
                    });
                }
            }else{
                app.showToastFn('发布失败');                              
            }
        }
        wx.request({
            url: URL+'mobile/desire/issue_v2',
            data: upload_obj,
            header: {  
                "Content-Type": "application/x-www-form-urlencoded"  
            },  
            method: 'POST', 
            success: success,
            fail: function() {
                app.showToastFn('发布失败');
            }
        });        
    }
});