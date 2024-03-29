var app = getApp();
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
};
Page({
  data: {
    inp_money: 0,
    iv: '',
    encryptedData: '',
    islogin: false,
    remind: '加载中',
    bank_name: '',
    binding: false,
    multiIndex: [0, 0, 0],
    date: '2021-03-01',
    time: '00:00',
    region: ['湖南省', '长沙市', '岳麓区'],
    customItem: '全部',
    items: [
      { name: '1', value: '男', checked: true },
      { name: '2', value: '女', checked: false },
    ],
    sex: 1
  },
  onReady: function () {

  },
  radioChange: function (e) {
    var items = this.data.items;
    for (var i = 0; i < items.length; i++) {
      if (items[i].name == e.detail.value) {
        items[i].checked = true;
      } else {
        items[i].checked = false;
      }
    }
    this.setData({
      items: items,
      sex: e.detail.value
    })

  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  onLoad: function () {
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor,
      backgroundColor: app.d.bgcolor, 
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
    wx.checkSession({
      success: function (e) {
        app.globalData.userInfo['session_key'] = app.globalData.userInfo.session_key;
      },
      fail: function () {
        wx.login({
          success: function (res) {
            var code = res.code;
            that.globalData.code = res.code;
            var userinfo = wx.getStorageSync('userInfo');
            that.globalData.userInfo = userinfo;
            app.getUserSessionKey(code, cb);
          }
        }); 
      }
    });
    var date = getNowFormatDate();
    console.log(date)
    this.setData({
      bgcolor: app.d.bgcolor,
      date: date
    });
    var that = this;
    wx.request({
      url: app.d.laikeUrl + '&action=user&m=perfect_index',
      method: 'post',
      data: {
        user_id: app.globalData.userInfo.user_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        var status = res.data.status;
        if (status == 1) {
          var data = res.data.data;
          var items = that.data.items;
          for (var i = 0; i < items.length; i++) {
            if (items[i].name == data.sex) {
              items[i].checked = true;
            } else {
              items[i].checked = false;
            }
          }
          if (data.province) {
            var region = [data.province, data.city, data.county];
          } else {
            var region = that.data.region;
          }
          if (data.birthday) {
            var date = data.birthday
          } else {
            var date = that.data.date;
          }
          that.setData({
            name: data.name,
            mobile: data.mobile,
            binding: res.data.binding,
            items: items,
            region: region,
            date: date,
            wx_id: data.wechat_id,
            sex: data.sex,
            remind: ''
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  renewal: function (e) {
    var that = this;
    that.setData({
      binding: !that.data.binding
    })
  },
  
  getPhoneNumber: function (e) {
    var res_d = e;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权',
        success: function (res) { }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '同意授权',
        success: function (res) {
          wx.request({
            url: app.d.laikeUrl + '&action=user&m=secret_key',
            method: 'post',
            data: {
              encryptedData: encryptedData, 
              iv: iv, 
              sessionId: app.globalData.userInfo.session_key
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              var status = res.data.status;
              if (status == 1) {
                that.setData({
                  islogin: true,
                  mobile: res.data.info
                })
              } else {
                app.getUserInfo(that, res_d);
              }
            },
            error: function (e) {
              wx.showToast({
                title: '网络异常！',
                duration: 2000
              });
            }
          })
        }
      })
    }
  },
  
  perfect: function (res) {
    console.log(res)
    var that = this;
    var region = this.data.region;

    for (var i = 0; i < region.length; i++) {
      if (region[i] == '全部') {
        wx.showToast({
          title: '请完善地址!',
          icon: 'none',
          duration: 1500
        })
        return false;
        break;
      }
    }
    var sex = that.data.sex;
    var province = region[0], city = region[1], county = region[2];
    if (res.detail.value.name.length == 0) {
      wx.showToast({
        title: '姓名不得为空!',
        icon: 'loading',
        duration: 1500
      })
      wx.hideToast()
    } else {

      wx.request({
        url: app.d.laikeUrl + '&action=user&m=perfect',
        method: 'post',
        data: {
          user_id: app.globalData.userInfo.user_id,
          name: res.detail.value.name,
          mobile: that.data.mobile,
          province: province,
          city: city,
          county: county,
          wx_id: res.detail.value.wx_id,
          sex: sex,
          date: that.data.date,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            wx.showToast({
              title: res.data.succ,
              icon: 'success',
              duration: 3000
            })

          } else {
            wx.showToast({
              title: res.data.err ? res.data.err : '非法操作！',
              icon: 'none',
              duration: 1500
            });
          }
          wx.navigateBack({
            delta: 1
          });
        },
        error: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        }
      });
    }
  },
})