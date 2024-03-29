var app = getApp()
Page({
  data: {
    current: 0,
    shopList: [],
    ptype: '',
    title: '',
    page: 1,
    catId: 0,
    brandId: 0,
    keyword: null,
    pagefrom: 'index',  
    goodslist: [], 
    remind: '加载中',
    heng: 'xs',
    shu: 'bxs',
    xianshi: 'icon-yduipaibanleixingliebiao',
    imageurl1: "../../images/mo.png",
    daindex1: 0,
    imageurl2: "../../images/mo.png",
    daindex2: 0,
    loading: false,
    period: false,
    select: 0,
    sort: 0,// 1 asc 升序   0 desc 降序
    types: '刷新', 
    bg: ''
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() 
    wx.hideNavigationBarLoading() 
    wx.stopPullDownRefresh() 
  },
  //上拉
  onReachBottom: function () {
    var that = this;
    if (that.data.keyword) {
      if (that.data.type != 1) {
        that.getkeywordgood(that.data.keyword, that.data.types);
      } else {
        that.setData({
          period: true
        });
      }
    } else {
      that.getMore();
    }
  },
  onLoad: function (options) {
    var objectId = options.class;
    var title = options.title;
    if (objectId || title) {
      wx.setNavigationBarColor({
        frontColor: app.d.frontColor,
        backgroundColor: app.d.bgcolor 
      })
      wx.setNavigationBarTitle({
        title: options.title,
        success: function () {
        },
      });
      this.setData({
        bgcolor: app.d.bgcolor,
        objectId: objectId,
        title: title,
      })
      this.listdetail(objectId);
    } else if (options.keyword) {
      var keyword = options.keyword;
      this.setData({
        pagefrom: 'keyword'
      });
      this.getkeywordgood(keyword);
    }
  },
  listdetail: function (objectId, types = 0) {
    var that = this;
    var select = that.data.select;
    var sort = that.data.sort;
    if (types == 0) {
      var page = that.data.page
    } else {
      var page = that.data.page + 1;
    }

    wx.request({
      url: app.d.laikeUrl + '&action=search&m=listdetail',
      method: 'post',
      data: {
        cid: objectId,
        select: select,
        sort: sort,
        page: page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status) {
          var shoplist = res.data.pro;
          if (types == 0) {
            that.setData({
              shopList: shoplist,
              bg: res.data.bg
            })
          } else {
            that.setData({
              page: page,
              shopList: that.data.shopList.concat(shoplist)
            })
          }
        } else {
          that.setData({
            period: true
          });
          return false;
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  
  getMore: function (e) {
    var that = this;
    var objectId = that.data.objectId;
    that.listdetail(objectId, 1);
  },
  
  lookdetail: function (e) {
    var lookid = e.currentTarget.dataset;
    wx.navigateTo({
      url: "../index/detail?id=" + lookid.id
    })
  },
  switchSlider: function (e) {
    this.setData({
      current: e.target.dataset.index
    })
  },
  changeSlider: function (e) {
    this.setData({
      current: e.detail.current
    })
  },

  getkeymore: function (e) {
    var that = this;
    that.getkeywordgood(that.data.keyword, that.data.types);
  },
  
  getkeywordgood: function (keyword, types) {
    var that = this;
    if (types == '刷新') {
      that.data.page = that.data.page + 1;
    } else {
      that.data.page = that.data.page;
    }
    that.setData({
      bgcolor: app.d.bgcolor,
      keyword: keyword,
      pagefrom: 'keyword',
    });
    wx.setNavigationBarTitle({
      title: keyword,
      success: function () {
      },
    });
    wx.setNavigationBarColor({
      frontColor: app.d.frontColor,
      backgroundColor: app.d.bgcolor 
    });
    wx.request({
      url: app.d.laikeUrl + '&action=search&m=search',
      method: 'post',
      data: {
        keyword: keyword,
        num: that.data.page,
        select: that.data.select,
        sort: that.data.sort,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.code == 1) {
          var goods = res.data.list;
          var type = res.data.type;
          if (type == 0) {
            that.data.objectId = res.data.cid;
            var page = that.data.page;
            var shoplist = [];
            for (var i = 0; i <= page * 2 - 1; i++) {
              if (i == goods.length) {
                break;
              }
              shoplist[i] = goods[i];
            }
            if (types) {
              that.setData({
                type: type,
                goodslist: goods,
                shopList: that.data.shopList.concat(shoplist)
              });
            } else {
              that.setData({
                type: type,
                shopList: goods
              });
            }
          } else {
            that.setData({
              type: type,
              shopList: goods
            });
          }
        } else {
          that.setData({
            period: true
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
  },
  onShow: function () {    
  },
  default: function (e) {
    var that = this;
    this.setData({
      select: 0,
      sort: 1,
      imageurl1: "../../images/mo.png",
      imageurl2: "../../images/mo.png",
      page: 1,
      period: false,
    })
    that.sort();
  },
  choosesort1: function (e) {
    var that = this;
    if (this.data.daindex1 == 0) {
      this.setData({
        imageurl1: "../../images/xia.png",
        daindex1: 1,
        imageurl2: "../../images/mo.png",
      })
    } else {
      this.setData({
        imageurl1: "../../images/shang.png",
        daindex1: 0,
        imageurl2: "../../images/mo.png",
      })
    }
    this.setData({
      select: 1,
      sort: that.data.daindex1,
      page: 1,
      period: false,
    });
    that.sort();
  },
  // 价格
  choosesort2: function (e) {
    var that = this;
    if (this.data.daindex2 == 0) {
      this.setData({
        imageurl2: "../../images/shang.png",
        daindex2: 1,
        imageurl1: "../../images/mo.png",
      })
    } else {
      this.setData({
        imageurl2: "../../images/xia.png",
        imageurl1: "../../images/mo.png",
        daindex2: 0
      })
    }
    this.setData({
      select: 2,
      sort: that.data.daindex2,
      page: 1,
      period: false,
    });
    that.sort();
  },
  //排序
  sort: function () {
    var that = this;
    var objectId = that.data.objectId;
    if (that.data.type == 1 || that.data.type == 0) {
      that.getkeywordgood(that.data.keyword);
    } else {
      that.listdetail(objectId);
    }
  },
  tabchage: function () {
    if (this.data.heng == 'xs') {
      this.setData({
        heng: 'bxs',
        shu: 'xs',
        xianshi: 'icon-yduipaibanleixingduicheng'
      })
    } else {
      this.setData({
        heng: 'xs',
        shu: 'bxs',
        xianshi: 'icon-yduipaibanleixingliebiao'
      })
    }
  },
  showModal: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  hideModal: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  onReady: function () {
    var that = this;
    that.setData({
      remind: ''
    });
  },
})