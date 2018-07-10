// pages/forscreen/forscreen.js
const app = getApp();
var openid = app.globalData.openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var timestamp = (new Date()).valueOf();
var box_mac = '';
Page({
  /**
 * 页面的初始数据
 */
  data: {
    Length: 3,        //输入框个数
    isFocus: true,    //聚焦
    Value: "",        //输入的内容
    ispassword: false, //是否密文显示 true为密文， false为明文。
    pwds:"",
   
    showView: false,     //是否显示投屏选择图片
    showCode: true      //显示填写验证码
  
  },
  Focus(e) {
    var that = this;
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue,
    })
  },
  Tap() {
    var that = this;
    that.setData({
      isFocus: true,
    })
  },
  formSubmit(e) {
    var that = this;
    var openid = app.globalData.openid;
    wx.request({
      url: 'https://mobile.littlehotspot.com/smallapp/index/checkcode',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        code: e.detail.value.password,
        box_mac:box_mac,
        openid:openid
      },
      success: function (res) {
        if(res.data.is_right==0){
         //刷新页面
        }else if(res.data.is_right==1){
          wx.showToast({
            title: '验证码输入错误，请重新输入',
            icon: 'none',
            duration: 2000
          }),
            that.setData({
              Length: 3,        //输入框个数
              isFocus: true,    //聚焦
              Value: "",        //输入的内容
              ispassword: false, //是否密文显示 true为密文， false为明文。  
              pwds : '',
              
            })
        }else if(res.data.is_right==2){
          that.setData({
            showView: (!that.data.showView),
            showCode: (!that.data.showCode)
          })
        }
        
      }
    })
  },
  //进来加载页面：
  onLoad: function (options) {
    wx.clearStorage();
    var that = this;
    box_mac = decodeURIComponent(options.scene);
    //box_mac = '1234';     //上线去掉**************************
    var openid = app.globalData.openid;
    if(box_mac =='' || box_mac=='undefined'){
      wx.navigateTo({
        url: '../index/index'
      })
    }
    if (openid=='' || openid=='undefined'){
      wx.navigateTo({
        url: '../index/index'
      })
    }
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
      headers: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        //console.log(res);
        policy = res.data.policy;
        signature = res.data.signature;
      }
    }),
    //发送随机码给电视显示 
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp/Index/genCode',
      headers: {
        'Content-Type': 'application/json'
      },
      data:{
        box_mac: box_mac,
        openid:openid 
      },
      method: "POST",
      success: function (res) {
        var is_have = res.data.is_have;
        if(is_have==0){
          
          var code = res.data.code;
            wx.request({
              url: 'https://netty-push.littlehotspot.com/push/box',
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              data:{
                box_mac:box_mac,
                cmd: 'call-mini-program',
                msg: '{"action":1,"code":' + code +'}',
                req_id: timestamp
              },
              success:function(rt){
                //console.log(rt);
              }
            })
        }else if(is_have==1) {
          that.setData({
            showView: (!that.data.showView),
            showCode: (!that.data.showCode)
          })
        }
      }
    })
  },
  chooseImage() {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        //var tempFilePaths = res.tempFilePaths
        var filename = res.tempFilePaths[0];
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        postf = filename.substring(index1, index2);//后缀名
        that.setData({
          tempFilePaths: res.tempFilePaths
        })

        wx.uploadFile({
          url: "https://oss.littlehotspot.com",
          filePath: res.tempFilePaths[0],
          name: 'file',
          formData: {
            Bucket: "redian-produce",
            name: res.tempFilePaths[0],
            key: "forscreen/resource/" + timestamp + postf,
            policy: policy,
            OSSAccessKeyId: "LTAITjXOpRHKflOX",
            sucess_action_status: "200",
            signature: signature

          },

          success: function (res) {
            wx.request({
              url: "https://netty-push.littlehotspot.com/push/box",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              data: { 
                box_mac: box_mac, 
                cmd: 'call-mini-program',
                msg: '{ "action": 2, "url": "forscreen/resource/' + timestamp + postf + '", "filename":"' + timestamp + postf +'"}' , 
                req_id: timestamp 
              },
              success: function (data) {
                wx.showToast({
                  title: '发送投屏成功',
                  icon: 'success',
                  duration: 1000
                })

              },
            })

          },
          fial: function ({ errMsg }) {
            console.log('uploadImage fial,errMsg is', errMsg)
          }
        })

      }
    })
  },
})