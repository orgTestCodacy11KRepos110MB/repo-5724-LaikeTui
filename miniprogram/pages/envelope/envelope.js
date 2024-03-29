var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    images: {}
  },
  imageLoad: function (e) {
    var $width = e.detail.width,    //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height;    //图片的真实宽高比例
    var viewWidth = 718,           //设置图片显示宽度，左右留有16rpx边距
      viewHeight = 718 / ratio;    //计算的高度值
    var image = this.data.images;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  },
  onLoad: function (options) {
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor,
      backgroundColor: app.d.bgcolor 
    })
    var that = this;
    var id = options.id;
    if (options.p_openid != '') {
      app.globalData.userInfo['p_openid'] = options.p_openid;
    } else {
      app.globalData.userInfo['p_openid'] = '';
    }
    that.setData({
      id: id,
    });
    that.y_detail(id);
    that.storage();
  },
  onShow: function () {

  },
  
  y_detail: function (id) {
    var that = this;
    wx.request({
      url: app.d.laikeUrl + '&action=envelope&m=index',
      method: 'post',
      data: {
        id: id,
      },
      header: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          var article = res.data.article;
          var content = article['0'].content;
          
          WxParse.wxParse('content', 'html', content, that, 3);
          that.setData({
            article: article['0'],
          })
          
          wx.setNavigationBarTitle({
            title: article['0'].Article_title
          });
        } else {
         
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },
  // 登录转发分享
  onShareAppMessage: function (res) {
    var that = this;
    var id = that.data.article.Article_id;
    var Article_title = that.data.article.Article_title;
    if (res.from === 'button') {
      
    }
    return {
      title: Article_title,
      path: '/pages/envelope/envelope?id=' + id + '&p_openid=' + app.globalData.userInfo.openid,
      success: function (res) {
        wx.request({
          url: app.d.laikeUrl + '&action=envelope&m=share',
          method: 'post',
          data: {
            id: id,
            openid: app.globalData.userInfo.openid
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.showToast({
              title: res.data.err,
              duration: 2000
            });
            if (res.data.info == 1) {
              wx.navigateTo({
                url: '../share/index?id=' + id + '&n=1',
              });
            }
          },
          fail: function (e) {
            wx.showToast({
              title: '网络异常！err:getsessionkeys',
              duration: 2000
            });
          },
        });
      },
      fail: function (res) {
        
      }
    }
  },
  storage: function () {
    var that = this;
    wx.request({
      url: app.d.laikeUrl + '&action=app&m=user',
      method: 'post',
      data: {
        nickName: app.globalData.userInfo.nickName,
        headimgurl: app.globalData.userInfo.avatarUrl,
        sex: app.globalData.userInfo.gender,
        openid: app.globalData.userInfo.openid,
        p_openid: app.globalData.userInfo.p_openid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
      },
      fail: function (e) {
      },
    });
  }
})