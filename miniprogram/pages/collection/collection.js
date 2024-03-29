var app = getApp();
Page({
  data: {
    remind: '加载中',
  },
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor,
      backgroundColor: app.d.bgcolor, 
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })

  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() 
    this.collection();
    wx.hideNavigationBarLoading() 
    wx.stopPullDownRefresh()
  },
  onReady: function () {    
  },
  
  onShow: function () {
    this.collection();
  },
  alldel: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要清除全部商品吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.d.laikeUrl + '&action=addFavorites&m=alldel',
            method: 'post',
            data: {
              openid: app.globalData.userInfo.openid,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              var status = res.data.status
              if (status == 1) {
                wx.showToast({
                  title: '清理成功！',
                  duration: 2000
                });
                that.setData({
                  list: []
                });
              } else {
                wx.showToast({
                  title: '清理失败!',
                  duration: 2000
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
        } else if (res.cancel) {
          
        }
      }
    })
  },
  collection: function () {
    var that = this;
    wx.request({
      url: app.d.laikeUrl + '&action=addFavorites&m=collection',
      method: 'post',
      data: {
        openid: app.globalData.userInfo.openid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status
        if (status == 1) {
          that.setData({
            list: res.data.list,
            bgcolor: app.d.bf_color,
            remind: ''
          });
        } else {
          wx.showToast({
            title: '暂时还没有收藏!',
            duration: 2000,
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
  
  removeFavorites: function (e) {
    console.log(e)
    var that = this;
    var id = e.currentTarget.dataset.favId;
    wx.showModal({
      title: '提示',
      content: '你确认移除吗',
      success: function (res) {
        res.confirm && wx.request({
          url: app.d.laikeUrl + '&action=addFavorites&m=removeFavorites',
          method: 'post',
          data: {
            id: id,
            openid: app.globalData.userInfo.openid,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            var status = res.data.status;
            if (status == 1) {
              wx.showToast({
                title: res.data.succ,
                duration: 2000
              });
              that.collection();
            } else {
              wx.showToast({
                title: res.data.err,
                duration: 2000
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
      }
    });
  }
});