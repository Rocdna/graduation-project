const local: App.I18n.Schema = {
  system: {
    title: '拼途灵动 🎉',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeSchema: {
      title: '主题模式',
      light: '亮色模式',
      dark: '暗黑模式',
      auto: '跟随系统'
    },
    grayscale: '灰色模式',
    colourWeakness: '色弱模式',
    layoutMode: {
      title: '布局模式',
      vertical: '左侧菜单模式',
      'vertical-mix': '左侧菜单混合模式',
      horizontal: '顶部菜单模式',
      'horizontal-mix': '顶部菜单混合模式',
      reverseHorizontalMix: '一级菜单与子级菜单位置反转'
    },
    recommendColor: '应用推荐算法的颜色',
    recommendColorDesc: '推荐颜色的算法参照',
    themeColor: {
      title: '主题颜色',
      primary: '主色',
      info: '信息色',
      success: '成功色',
      warning: '警告色',
      error: '错误色',
      followPrimary: '跟随主色'
    },
    scrollMode: {
      title: '滚动模式',
      wrapper: '外层滚动',
      content: '主体滚动'
    },
    page: {
      animate: '页面切换动画',
      mode: {
        title: '页面切换动画类型',
        'fade-slide': '滑动',
        fade: '淡入淡出',
        'fade-bottom': '底部消退',
        'fade-scale': '缩放消退',
        'zoom-fade': '渐变',
        'zoom-out': '闪现',
        none: '无'
      }
    },
    fixedHeaderAndTab: '固定头部和标签栏',
    header: {
      height: '头部高度',
      breadcrumb: {
        visible: '显示面包屑',
        showIcon: '显示面包屑图标'
      },
      multilingual: {
        visible: '显示多语言按钮'
      }
    },
    tab: {
      visible: '显示标签栏',
      cache: '标签栏信息缓存',
      height: '标签栏高度',
      mode: {
        title: '标签栏风格',
        chrome: '谷歌风格',
        button: '按钮风格'
      }
    },
    sider: {
      inverted: '深色侧边栏',
      width: '侧边栏宽度',
      collapsedWidth: '侧边栏折叠宽度',
      mixWidth: '混合布局侧边栏宽度',
      mixCollapsedWidth: '混合布局侧边栏折叠宽度',
      mixChildMenuWidth: '混合布局子菜单宽度'
    },
    footer: {
      visible: '显示底部',
      fixed: '固定底部',
      height: '底部高度',
      right: '底部局右'
    },
    watermark: {
      visible: '显示全屏水印',
      text: '水印文本'
    },
    themeDrawerTitle: '主题配置',
    pageFunTitle: '页面功能',
    resetCacheStrategy: {
      title: '重置缓存策略',
      close: '关闭页面',
      refresh: '刷新页面'
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  route: {
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    system_home: '仪表盘',
    ride: '灵动起航',
    ride_order: '我的订单',
    ride_profile: '个人中心',
    ride_review: '行程评论',
    ride_carpool: '灵动拼车',
    ride_grab: '拼途接单',
    system_manage_order: '订单管理',
    system_manage_driver: '司机管理',
    system_manage_passenger: '乘客管理',
    system_manage_review: '评价管理',
    system: '工作台',
    home: '拼途灵动 🎉',
    document: '文档',
    document_project: '项目文档',
    'system_user-center': '个人中心',
    system_about: '关于',
    system_function: '系统功能',
    system_function_tab: '标签页',
    'system_function_multi-tab': '多标签页',
    'system_function_hide-child': '隐藏子菜单',
    'system_function_hide-child_one': '隐藏子菜单',
    'system_function_hide-child_two': '菜单二',
    'system_function_hide-child_three': '菜单三',
    system_function_request: '请求',
    'system_function_toggle-auth': '切换权限',
    'system_function_super-page': '超级管理员可见',
    system_manage: '系统管理',
    system_manage_menu: '菜单管理',
    'system_multi-menu': '多级菜单',
    'system_multi-menu_first': '菜单一',
    'system_multi-menu_first_child': '菜单一子菜单',
    'system_multi-menu_second': '菜单二',
    'system_multi-menu_second_child': '菜单二子菜单',
    'system_multi-menu_second_child_home': '菜单二子菜单首页',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    system_plugin: '插件示例',
    system_plugin_copy: '剪贴板',
    system_plugin_charts: '图表',
    system_plugin_charts_echarts: 'ECharts',
    system_plugin_charts_antv: 'AntV',
    system_plugin_charts_vchart: 'VChart',
    system_plugin_editor: '编辑器',
    system_plugin_editor_quill: '富文本编辑器',
    system_plugin_editor_markdown: 'MD 编辑器',
    system_plugin_icon: '图标',
    system_plugin_map: '地图',
    system_plugin_print: '打印',
    system_plugin_swiper: 'Swiper',
    system_plugin_video: '视频',
    system_plugin_barcode: '条形码',
    system_plugin_pinyin: '拼音',
    system_plugin_excel: 'Excel',
    system_plugin_pdf: 'PDF 预览',
    system_plugin_gantt: '甘特图',
    system_plugin_gantt_dhtmlx: 'dhtmlxGantt',
    system_plugin_gantt_vtable: 'VTableGantt',
    system_plugin_typeit: '打字机',
    system_plugin_tables: '表格',
    system_plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        invalidCode: '验证码错误',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住我',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        passenger: '乘客',
        admin: '管理员',
        driver: '司机'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        passenger: '乘客',
        driver: '司机',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》',
        success: '注册成功，去登录吧',
        failure: '注册失败'
      },
      resetPwd: {
        title: '重置密码',
        success: '重置密码成功',
        failure: '重置密码失败'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    about: {
      title: '关于',
      introduction: `SoybeanAdmin 是一个优雅且功能强大的后台管理模板，基于最新的前端技术栈，包括 Vue3, Vite5, TypeScript, Pinia 和 UnoCSS。它内置了丰富的主题配置和组件，代码规范严谨，实现了自动化的文件路由系统。此外，它还采用了基于 ApiFox 的在线Mock数据方案。SoybeanAdmin 为您提供了一站式的后台管理解决方案，无需额外配置，开箱即用。同样是一个快速学习前沿技术的最佳实践。`,
      projectInfo: {
        title: '项目信息',
        version: '版本',
        latestBuildTime: '最新构建时间',
        githubLink: 'Github 地址',
        previewLink: '预览地址'
      },
      prdDep: '生产依赖',
      devDep: '开发依赖'
    },
    home: {
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '早安，{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      todayOrders: "今日订单",
      todayMatchRate: "今日完成率",
      newUsers: "今日新增用户",
      orderCount: "订单量",
      revenue: "收入",
      activeUsers: "活跃用户数",
      userDistribution: "用户分布",
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      todayOrderCount: "今日订单量",
      todayRevenue: "今日收入",
      activeDrivers: "活跃司机数",
      activePassengers: "活跃乘客数",
      projectNews: {
        title: '系统动态',
        moreNews: '更多动态',
        desc1: '拼车系统新增多人拼车功能，支持3人以上拼车！',
        desc2: '今日订单量突破1000单，创历史新高！',
        desc3: '管理员审核通过50名新司机，司机团队持续壮大。',
        desc4: '系统将于2025年3月21日凌晨进行维护，请提前通知用户。',
        desc5: '新增用户达到500人，拼车服务受到广泛欢迎！'
      },
      creativity: '创意'
    },
    function: {
      tab: {
        tabOperate: {
          title: '标签页操作',
          addTab: '添加标签页',
          addTabDesc: '跳转到关于页面',
          closeTab: '关闭标签页',
          closeCurrentTab: '关闭当前标签页',
          closeAboutTab: '关闭"关于"标签页',
          addMultiTab: '添加多标签页',
          addMultiTabDesc1: '跳转到多标签页页面',
          addMultiTabDesc2: '跳转到多标签页页面(带有查询参数)'
        },
        tabTitle: {
          title: '标签页标题',
          changeTitle: '修改标题',
          change: '修改',
          resetTitle: '重置标题',
          reset: '重置'
        }
      },
      multiTab: {
        routeParam: '路由参数',
        backTab: '返回 function_tab'
      },
      toggleAuth: {
        toggleAccount: '切换账号',
        authHook: '权限钩子函数 `hasAuth`',
        superAdminVisible: '超级管理员可见',
        adminVisible: '管理员可见',
        adminOrUserVisible: '管理员和用户可见'
      },
      request: {
        repeatedErrorOccurOnce: '重复请求错误只出现一次',
        repeatedError: '重复请求错误',
        repeatedErrorMsg1: '自定义请求错误 1',
        repeatedErrorMsg2: '自定义请求错误 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: '发送验证码',
        autoRequest: '自动请求',
        visibilityRequestTips: '浏览器窗口切换自动请求数据',
        pollingRequestTips: '每3秒自动请求一次',
        networkRequestTips: '网络重连后自动请求',
        refreshTime: '更新时间',
        startRequest: '开始请求',
        stopRequest: '停止请求',
        requestCrossComponent: '跨组件触发请求',
        triggerAllRequest: '手动触发所有自动请求'
      }
    },
    manage: {
      common: {
        status: {
          enable: '启用',
          disable: '禁用'
        }
      },
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleCode: '角色编码',
        roleStatus: '角色状态',
        roleDesc: '角色描述',
        menuAuth: '菜单权限',
        buttonAuth: '按钮权限',
        form: {
          roleName: '请输入角色名称',
          roleCode: '请输入角色编码',
          roleStatus: '请选择角色状态',
          roleDesc: '请输入角色描述'
        },
        addRole: '新增角色',
        editRole: '编辑角色'
      },
      user: {
        title: '用户列表',
        id: '编号',
        userName: '用户名',
        userGender: '性别',
        nickName: '昵称',
        userPhone: '手机号',
        userEmail: '邮箱',
        userStatus: '用户状态',
        userRole: '用户角色',
        rating: '评分',
        status: {
          offline: '离线',
          online: '在线',
          locked: '冻结',
        },
        paymentMethod: {
          wechat: '微信',
          alipay: '支付宝',
          bank: '银行卡'
        },
        defaultPaymentMethod: '默认支付方式',
        licensePlate: "车牌号",
        vehicleModel: "车辆型号",
        form: {
          userName: '请输入用户名',
          userGender: '请选择性别',
          nickName: '请输入昵称',
          userPhone: '请输入手机号',
          userEmail: '请输入邮箱',
          userStatus: '请选择用户状态',
          userRole: '请选择用户角色',
          idNumber: '身份证号',
          birthDate: '出生日期',
          password: '账号密码',
          usernameRequired: '用户名不能为空',
          usernameLength: '用户名长度不能超过20位',
          phoneRequired: "请输入手机号",
          phoneInvalid: "请输入有效的手机号",
          passwordRequired: "请输入密码",
          passwordLength: "密码长度必须为6-20位",
          nameRequired: "请输入昵称",
          nameLength: "昵称长度必须为2-50位",
          idNumberInvalid: '请输入有效的身份证号',
          licensePlateInvalid: "请输入有效的车牌号（5-10位字母或数字）",
          vehicleModelLength: "车型长度不能超过50位",
          defaultPaymentMethod: '支付方式',
        },
        addUser: '新增用户',
        editUser: '编辑用户',
        gender: {
          male: '男',
          female: '女',
          other: '其他'
        },
        messages: {
          addSuccess: "添加成功",
          updateSuccess: "更新信息成功",
          operationFailed: "操作失败",
          deleteSuccess: "删除成功",
          deleteFailed: "删除失败",
          batchDeleteSuccess: "批量删除成功",
          batchDeletePartialSuccess: "批量删除部分成功，失败ID: {failedIds}",
          batchDeleteFailed: "批量删除失败",
        }
      },
      menu: {
        home: '首页',
        title: '菜单列表',
        id: 'ID',
        parentId: '父级菜单ID',
        menuType: '菜单类型',
        menuName: '菜单名称',
        routeName: '路由名称',
        routePath: '路由路径',
        pathParam: '路径参数',
        layout: '布局',
        page: '页面组件',
        i18nKey: '国际化key',
        icon: '图标',
        localIcon: '本地图标',
        iconTypeTitle: '图标类型',
        order: '排序',
        constant: '常量路由',
        keepAlive: '缓存路由',
        href: '外链',
        hideInMenu: '隐藏菜单',
        activeMenu: '高亮的菜单',
        multiTab: '支持多页签',
        fixedIndexInTab: '固定在页签中的序号',
        query: '路由参数',
        button: '按钮',
        buttonCode: '按钮编码',
        buttonDesc: '按钮描述',
        menuStatus: '菜单状态',
        form: {
          home: '请选择首页',
          menuType: '请选择菜单类型',
          menuName: '请输入菜单名称',
          routeName: '请输入路由名称',
          routePath: '请输入路由路径',
          pathParam: '请输入路径参数',
          page: '请选择页面组件',
          layout: '请选择布局组件',
          i18nKey: '请输入国际化key',
          icon: '请输入图标',
          localIcon: '请选择本地图标',
          order: '请输入排序',
          keepAlive: '请选择是否缓存路由',
          href: '请输入外链',
          hideInMenu: '请选择是否隐藏菜单',
          activeMenu: '请选择高亮的菜单的路由名称',
          multiTab: '请选择是否支持多标签',
          fixedInTab: '请选择是否固定在页签中',
          fixedIndexInTab: '请输入固定在页签中的序号',
          queryKey: '请输入路由参数Key',
          queryValue: '请输入路由参数Value',
          button: '请选择是否按钮',
          buttonCode: '请输入按钮编码',
          buttonDesc: '请输入按钮描述',
          menuStatus: '请选择菜单状态'
        },
        addMenu: '新增菜单',
        editMenu: '编辑菜单',
        addChildMenu: '新增子菜单',
        type: {
          directory: '目录',
          menu: '菜单'
        },
        iconType: {
          iconify: 'iconify图标',
          local: '本地图标'
        }
      },
      order: {
        title: '订单管理',
        // 统计相关
        stats: {
          totalOrders: '总订单量',
          totalRevenue: '总收入',
          avgMatchRate: '平均匹配率',
          orderCount: '订单量',
          revenue: '收入'
        },
        // 筛选条件
        filter: {
          status: '状态',
          dateStart: '起始时间',
          dateRange: '至',
          dateEnd: '结束时间',
          orderNumber: '订单编号',
          filter: '过滤',
          reset: '重置',
          statusOptions: {
            all: '全部',
            pending: '待匹配',
            matched: '已匹配',
            confirmed: '已确认',
            cancelled: '已取消',
            completed: '已完成'
          }
        },
        // 表格列
        table: {
          orderNumber: '订单编号',
          status: '运行状态',
          paymentStatus: '支付状态',
          totalPrice: '金额',
          createdAt: '创建时间',
          actions: '操作',
          viewDetails: '查看详情',
          updateStatus: '调整状态',
          passenger: '乘客',
          driver: '司机',
        },
        // 订单详情
        details: {
          title: '订单详情',
          orderNumber: '订单编号',
          status: '状态',
          startLocation: '起始地点',
          endLocation: '目的地点',
          requestedTime: '请求时间',
          seatCount: '座位数',
          totalPrice: '金额',
          paymentStatus: '支付状态',
          paymentMethod: '支付方式',
          paymentTime: '支付时间',
          passenger: '乘客',
          driver: '司机',
          createdAt: '创建时间',
          cancelReason: '取消原因'
        },
        // 状态调整
        statusDialog: {
          title: '调整订单状态',
          status: '状态',
          cancelReason: '取消原因',
          cancelReasonPlaceholder: '请输入取消原因',
          confirm: '确定',
          cancel: '取消'
        },
        // 操作提示
        messages: {
          fetchOrdersFailed: '获取订单列表失败',
          fetchDetailsFailed: '获取订单详情失败',
          updateStatusSuccess: '订单状态更新成功',
          updateStatusFailed: '订单状态更新失败',
          noOrders: '暂无订单',
          cancelReasonRequired: '请填写取消原因',
          orderCancelledCannotModify: '订单已取消，无法修改状态', // 新增
        },
        actions: {
          viewDetails: '查看详情',
          adjustStatus: '调整状态'
        },
        status: {
          pending: '待匹配',
          matched: '已匹配',
          confirmed: '已确认',
          cancelled: '已取消',
          completed: '已完成'
        },
      },
      review: {
        orderNumber: '订单编号',
        reviewer: '评价者',
        reviewee: '被评价者',
        reviewerId: '评价者ID',
        revieweeId: '被评价者ID',
        reviewType: '评价类型',
        rating: '评分',
        content: '评价内容',
        createdAt: '评价时间',
        audit: '审核',
        reason: '删除理由',
        isAnonymous: '是否匿名',
        type: {
          PToD: '乘客对司机评价',
          DToP: '司机对乘客评价',
        },
        status: {
          title: '状态',
          pending: '待评价',
          under_review: '审核中',
          completed: '已评价',
          rejected: '被删除评价',
        },
        messages: {
          deleteSuccess: '删除成功',
          auditSuccess: '审核成功',
          operationFailed: '操作失败',
        },
        form: {
          statusRequired: "请选择状态",
          statusInvalid: "状态必须为通过或拒绝",
          reasonRequired: "请输入理由",
          reasonMinLength: "理由不少于2个字符",
          reasonMaxLength: "理由不超过500个字符",
        }
      },
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条'
  }
};

export default local;
