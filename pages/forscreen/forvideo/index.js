// pages/forscreen/forvideo/index.js
const app = getApp();
var tmp;
var openid;
var policy;
var signature;
var postf;   //上传文件扩展名
var box_mac = '';
var forscreen_char = '';
var res_sup_time;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showVedio:false,
    showRechoose:false,
    upload_vedio_temp:'',
    duration:0,
    //upload_vedio_img_temp:'',
    vedio_percent: 0,
    item: [
      { 'name': '公开时显示餐厅信息', 'value': '1', 'checked': false, 'disabled': false },
      { 'name': '公开发表，公众可见', 'value': '2', 'checked': false, 'disabled': false },

    ],
    is_pub_hotelinfo: 1,  //是否公开酒楼信息
    is_share: 1 ,         //是否分享到发现栏目
    is_btn_disabel:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    var box_mac = e.box_mac;
    var openid = e.openid;
    
    that.setData({
      openid: openid,
      box_mac: box_mac,
      upload_vedio_temp: '',
    })

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        that.setData({
          showVedio: true,
          upload_vedio_temp:res.tempFilePath,
          duration: res.duration
        });
        //res_sup_time = (new Date()).valueOf();
        //uploadVedio(res, box_mac, openid, res_sup_time);
      },fail:function(res){
        wx.navigateBack({
          delta: 1,
        })
      }
    });
    
    
  },

  forscreen_video: function (res) {
    var that= this;
    that.setData({
      is_btn_disabel:true,
    })
    var video = res.target.dataset.video;
    var box_mac = res.target.dataset.box_mac;
    var openid = res.target.dataset.openid;
    var is_pub_hotelinfo = res.target.dataset.is_pub_hotelinfo;
    var is_share = res.target.dataset.is_share;
    var duration = res.target.dataset.duration;
    
    res_sup_time = (new Date()).valueOf();
    uploadVedio(video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration);
    function uploadVedio(video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration) {
     
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration);
        }
      });
    }
    function uploadOssVedio(policy, signature, video, box_mac, openid, res_sup_time, is_pub_hotelinfo, is_share, duration) {
      
      var filename = video;          //视频url

      //var filename_img = video.thumbTempFilePath; //视频封面图
      //console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();

      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: filename,
        name: 'file',

        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {

        }
      });
      upload_task.onProgressUpdate((res) => {
        //console.log(res);

        that.setData({
          vedio_percent: res.progress
        });
        if (res.progress == 100) {
          var res_eup_time = (new Date()).valueOf();
          //console.log(res_eup_time);
          that.setData({
            showVedio:false,
          })
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              openid: openid,
              box_mac: box_mac,
              action: 2,
              resource_type: 2,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
              resource_id: timestamp,
              res_sup_time: res_sup_time,
              res_eup_time: res_eup_time,
              resource_size: res.totalBytesSent,
              is_pub_hotelinfo: is_pub_hotelinfo,
              is_share: is_share,
              forscreen_id: res_eup_time,
              duration: duration,
            },
            success: function (ret) {
              wx.request({
                url: "https://netty-push.littlehotspot.com/push/box",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  cmd: 'call-mini-program',
                  msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '"}',
                  req_id: timestamp
                },
                success: function (result) {
                    

                },
              });
            }
          });
        }

      });
      that.setData({

        showVedio: true,
        upload_vedio_temp: filename,
        //upload_vedio_img_temp: filename_img,

      });
    }
  },

  //重新选择视频
  chooseVedio(e) {
    var that = this
    that.setData({
      is_btn_disabel:false
    })
    var box_mac = e.currentTarget.dataset.boxmac;
    var openid = e.currentTarget.dataset.openid;
    

    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        that.setData({
          showVedio: true,
          upload_vedio_temp: res.tempFilePath,
          vedio_percent:0
        });
        //uploadVedio(res, box_mac, openid);
      }
    });
    function uploadVedio(video, box_mac, openid) {
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallapp/Index/getOssParams',
        headers: {
          'Content-Type': 'application/json'
        },
        success: function (rest) {
          policy = rest.data.policy;
          signature = rest.data.signature;
          uploadOssVedio(policy, signature, video, box_mac, openid);
        }
      });
    }
    function uploadOssVedio(policy, signature, video, box_mac, openid) {

      var filename = video.tempFilePath;          //视频url
      //var filename_img = video.thumbTempFilePath; //视频封面图
      //console.log(video);
      var index1 = filename.lastIndexOf(".");
      var index2 = filename.length;
      var mobile_brand = app.globalData.mobile_brand;
      var mobile_model = app.globalData.mobile_model;
      var postf_t = filename.substring(index1, index2);//后缀名
      var timestamp = (new Date()).valueOf();

      var upload_task = wx.uploadFile({
        url: "https://image.littlehotspot.com",
        filePath: filename,
        name: 'file',

        formData: {
          Bucket: "redian-produce",
          name: filename,
          key: "forscreen/resource/" + timestamp + postf_t,
          policy: policy,
          OSSAccessKeyId: "LTAITjXOpRHKflOX",
          sucess_action_status: "200",
          signature: signature

        },
        success: function (res) {

          /*wx.request({
            url: "https://netty-push.littlehotspot.com/push/box",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            data: {
              box_mac: box_mac,
              cmd: 'call-mini-program',
              msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp+'"}',
              req_id: timestamp
            },
            success: function (result) {
             

            },
          });*/
        }
      });
      upload_task.onProgressUpdate((res) => {
        //console.log(res.progress);
        that.setData({
          vedio_percent: res.progress
        })
        if (res.progress == 100) {
          var res_eup_time = (new Date()).valueOf();
          //console.log(res_eup_time);

          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallapp/index/recordForScreenPics',
            header: {
              'content-type': 'application/json'
            },
            data: {
              openid: openid,
              box_mac: box_mac,
              action: 2,
              resource_type: 2,
              mobile_brand: mobile_brand,
              mobile_model: mobile_model,
              forscreen_char: forscreen_char,
              imgs: '["forscreen/resource/' + timestamp + postf_t + '"]',
              resource_id: timestamp,
              res_sup_time: res_sup_time,
              res_eup_time: res_eup_time,
              resource_size: res.totalBytesSent
            },
            success:function(ret){
              wx.request({
                url: "https://netty-push.littlehotspot.com/push/box",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                data: {
                  box_mac: box_mac,
                  cmd: 'call-mini-program',
                  msg: '{ "action":2, "url": "forscreen/resource/' + timestamp + postf_t + '", "filename":"' + timestamp + postf_t + '","openid":"' + openid + '","resource_type":2,"video_id":"' + timestamp + '"}',
                  req_id: timestamp
                },
                success: function (result) {


                },
              });
            }
          });
        }

      });
      that.setData({
        
        showVedio: true,
        upload_vedio_temp: filename

      });
    }
  },

  //退出投屏
  exitForscreen(e) {
    var that = this;
    openid = e.currentTarget.dataset.openid;
    box_mac = e.currentTarget.dataset.boxmac;
    var timestamp = (new Date()).valueOf();
    wx.request({
      url: "https://netty-push.littlehotspot.com/push/box",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: {
        box_mac: box_mac,
        cmd: 'call-mini-program',
        msg: '{ "action": 3,"openid":"' + openid + '"}',
        req_id: timestamp
      },
      success: function (res) {
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常，退出失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //是否公开显示餐厅信息
  checkboxChange: function (e) {
    var that = this;
    //console.log(e.detail.value.length);
    var check_lenth = e.detail.value.length;
    var check_arr = e.detail.value;
    if (check_lenth == 2) {
      that.setData({
        is_share: 1,
        is_pub_hotelinfo: 1
      })
    } else if (check_lenth == 1) {
      if (check_arr[0] == 1) {
        that.setData({
          is_share: 0,
          is_pub_hotelinfo: 1
        })
      } else if (check_arr[0] == 2) {
        that.setData({
          is_share: 1,
          is_pub_hotelinfo: 0
        })
      }
    } else if (check_lenth == 0) {
      that.setData({
        is_pub_hotelinfo: 0,
        is_share: 0
      })
    }
    var check_arr = e.detail.value;


  },//是否公开显示餐厅信息结束
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})