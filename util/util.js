var xml2json = require('./xml2json');
const MD5Util = require('./md5'); 
const notifyUrl = "https://test.qtest.cc/haul/wxnotify";

function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-');
}

function formatDate2(date) {

  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()

  var str = "";

  year = formatNumber( year );
  month = formatNumber( month );  
  day = formatNumber( day );  

  if( parseInt(hour) < 13 ){
    str = "上午";
  }else{
    str = "下午";
  }
  return year+"年"+month+"月"+day+"日"+" "+str;
}

function formatDate3(date) {
  var hour = date.getHours()
  var str = "";

  if( parseInt(hour) < 13 ){
    str = "上午";
  }else{
    str = "下午";
  }
  return str;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function unifiedOrder( that ,fn ){
    let wxOpenId = wx.getStorageSync('wxId');
    let randUtils = function(){ //生成随机字符串
        let letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let generatePassword = function(length,resource){
            length = length || 32;   
            var s = "";  
            for(var i = 0;i < length; i++)  {  
                s += resource.charAt(
                Math.ceil(Math.random()*1000)%resource.length);  
            }
            return s;  
        };
        return generatePassword(32, letter);
    }

    let noncestr = randUtils();
    let user_ip = "192.168.1.100";
    let notify_url = notifyUrl; 
    let sign = '';  
    let totalFee=0;

    if(  !!Math.round( that.data.totalFee*100 )  ){
        totalFee = Math.round( that.data.totalFee*100 );
    }else{
        totalFee =  Math.round( that.data.balancePay*100 );
    }   

    let out_trade_no = '';
    if( !!that.data.orderNo){
        out_trade_no = that.data.orderNo;
    }else{
        out_trade_no = that.data.outTradeNo;
    }

    let signA = "appid=wx11a24fceaee90b36&body=test&device_info=WEB&mch_id=1388972802&nonce_str="+noncestr+"&notify_url="+notify_url+"&openid="+wxOpenId+"&out_trade_no="+out_trade_no+"&spbill_create_ip="+user_ip+"&total_fee="+totalFee+"&trade_type=JSAPI";
    let signB = signA+"&key=kinghanhong20160909sdgkdkkgdgkdk"; 

    sign = MD5Util.MD5(signB).toUpperCase();  

    let formData = "<xml>";   
        formData += "<appid>wx11a24fceaee90b36</appid>";  //appid  
        formData += "<body>test</body>";  
        formData += "<device_info>WEB</device_info>";  //商户号  
        formData += "<mch_id>1388972802</mch_id>";  //商户号  
        formData += "<nonce_str>" + noncestr + "</nonce_str>";  //随机字符串，不长于32位。  
        formData += "<notify_url>"+notify_url+"</notify_url>";   
        formData += "<openid>" + wxOpenId + "</openid>"; 
        formData += "<out_trade_no>"+out_trade_no+"</out_trade_no>";      
        formData += "<spbill_create_ip>"+user_ip+"</spbill_create_ip>"; 
        formData += "<total_fee>" + totalFee + "</total_fee>"; 
        formData += "<trade_type>JSAPI</trade_type>"; 
        formData += "<sign>" + sign + "</sign>";   
        formData += "</xml>"; 

    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      data:formData,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {  
          "Content-Type": "application/x-www-form-urlencoded"  
      },  
      success: function(res){
          let data = xml2json( res.data ).xml;
          let return_code = data.return_code["#text"];
          let result_code = data.result_code["#text"];

          if( (return_code =="SUCCESS") && (result_code =="SUCCESS") ) {         
            let obj = {
                appid: data.appid["#text"],
                device_info: data.device_info["#text"],
                mch_id: data.mch_id["#text"],
                nonce_str: data.nonce_str["#text"],
                prepay_id: data.prepay_id["#text"],
                return_code: data.return_code["#text"],
                result_code: data.result_code["#text"],
                return_msg: data.return_msg["#text"],   
                sign: data.sign["#text"],
                trade_type: data.trade_type["#text"]  
            }         
            fn&&fn(obj);
          }
      }
    });
}

module.exports = {   
  formatDate: formatDate,
  formatDate2 : formatDate2,
  unifiedOrder: unifiedOrder,
  formatDate3: formatDate3
}
