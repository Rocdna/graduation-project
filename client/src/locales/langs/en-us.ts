const local: App.I18n.Schema = {
  system: {
    title: 'RideFlex 👏',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    batchDelete: 'Batch Delete',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    updateSuccess: 'Update Success',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    }
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeSchema: {
      title: 'Theme Schema',
      light: 'Light',
      dark: 'Dark',
      auto: 'Follow System'
    },
    grayscale: 'Grayscale',
    colourWeakness: 'Colour Weakness',
    layoutMode: {
      title: 'Layout Mode',
      vertical: 'Vertical Menu Mode',
      horizontal: 'Horizontal Menu Mode',
      'vertical-mix': 'Vertical Mix Menu Mode',
      'horizontal-mix': 'Horizontal Mix menu Mode',
      reverseHorizontalMix: 'Reverse first level menus and child level menus position'
    },
    recommendColor: 'Apply Recommended Color Algorithm',
    recommendColorDesc: 'The recommended color algorithm refers to',
    themeColor: {
      title: 'Theme Color',
      primary: 'Primary',
      info: 'Info',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
      followPrimary: 'Follow Primary'
    },
    scrollMode: {
      title: 'Scroll Mode',
      wrapper: 'Wrapper',
      content: 'Content'
    },
    page: {
      animate: 'Page Animate',
      mode: {
        title: 'Page Animate Mode',
        fade: 'Fade',
        'fade-slide': 'Slide',
        'fade-bottom': 'Fade Zoom',
        'fade-scale': 'Fade Scale',
        'zoom-fade': 'Zoom Fade',
        'zoom-out': 'Zoom Out',
        none: 'None'
      }
    },
    fixedHeaderAndTab: 'Fixed Header And Tab',
    header: {
      height: 'Header Height',
      breadcrumb: {
        visible: 'Breadcrumb Visible',
        showIcon: 'Breadcrumb Icon Visible'
      },
      multilingual: {
        visible: 'Display multilingual button'
      }
    },
    tab: {
      visible: 'Tab Visible',
      cache: 'Tag Bar Info Cache',
      height: 'Tab Height',
      mode: {
        title: 'Tab Mode',
        chrome: 'Chrome',
        button: 'Button'
      }
    },
    sider: {
      inverted: 'Dark Sider',
      width: 'Sider Width',
      collapsedWidth: 'Sider Collapsed Width',
      mixWidth: 'Mix Sider Width',
      mixCollapsedWidth: 'Mix Sider Collapse Width',
      mixChildMenuWidth: 'Mix Child Menu Width'
    },
    footer: {
      visible: 'Footer Visible',
      fixed: 'Fixed Footer',
      height: 'Footer Height',
      right: 'Right Footer'
    },
    watermark: {
      visible: 'Watermark Full Screen Visible',
      text: 'Watermark Text'
    },
    themeDrawerTitle: 'Theme Configuration',
    pageFunTitle: 'Page Function',
    resetCacheStrategy: {
      title: 'Reset Cache Strategy',
      close: 'Close Page',
      refresh: 'Refresh Page'
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  route: {
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    'iframe-page': 'Iframe',
    ride: 'Agile Launch',
    ride_order: 'My Order',
    ride_profile: 'My Profile',
    ride_review: 'My Review',
    ride_carpool: 'My Carpool',
    ride_grab: 'My Grab',
    home: 'RideFlex 👏',
    document: 'Document',
    document_project: 'Project Document',
    'system_user-center': 'User Center',
    system: 'WorkPlace',
    system_home: 'Dashtable',
    system_about: 'About',
    system_function: 'System Function',
    system_function_tab: 'Tab',
    'system_function_multi-tab': 'Multi Tab',
    'system_function_hide-child': 'Hide Child',
    'system_function_hide-child_one': 'Hide Child',
    'system_function_hide-child_two': 'Two',
    'system_function_hide-child_three': 'Three',
    system_function_request: 'Request',
    'system_function_toggle-auth': 'Toggle Auth',
    'system_function_super-page': 'Super Admin Visible',
    system_manage: 'System Manage',
    system_manage_driver: 'Driver Manage',
    system_manage_passenger: 'Passenger Manage',
    system_manage_review: 'Review Manage',
    system_manage_order: 'Order Manage',
    system_manage_menu: 'Menu Manage',
    'system_multi-menu': 'Multi Menu',
    'system_multi-menu_first': 'Menu One',
    'system_multi-menu_first_child': 'Menu One Child',
    'system_multi-menu_second': 'Menu Two',
    'system_multi-menu_second_child': 'Menu Two Child',
    'system_multi-menu_second_child_home': 'Menu Two Child Home',
    exception: 'Exception',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    system_plugin: 'Plugin',
    system_plugin_copy: 'Copy',
    system_plugin_charts: 'Charts',
    system_plugin_charts_echarts: 'ECharts',
    system_plugin_charts_antv: 'AntV',
    system_plugin_charts_vchart: 'VChart',
    system_plugin_editor: 'Editor',
    system_plugin_editor_quill: 'Quill',
    system_plugin_editor_markdown: 'Markdown',
    system_plugin_icon: 'Icon',
    system_plugin_map: 'Map',
    system_plugin_print: 'Print',
    system_plugin_swiper: 'Swiper',
    system_plugin_video: 'Video',
    system_plugin_barcode: 'Barcode',
    system_plugin_pinyin: 'pinyin',
    system_plugin_excel: 'Excel',
    system_plugin_pdf: 'PDF preview',
    system_plugin_gantt: 'Gantt Chart',
    system_plugin_gantt_dhtmlx: 'dhtmlxGantt',
    system_plugin_gantt_vtable: 'VTableGantt',
    system_plugin_typeit: 'Typeit',
    system_plugin_tables: 'Tables',
    system_plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: 'Login / Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        invalidCode: 'Verification code error',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !'
      },
      pwdLogin: {
        title: 'Password Login',
        rememberMe: 'Remember me',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherAccountLogin: 'Other Account Login',
        otherLoginMode: 'Other Login Mode',
        passenger: 'Passenger',
        admin: 'Admin',
        driver: 'Driver'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        passenger: 'Passenger',
        driver: 'Driver',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》',
        success: 'Register Success',
        failure: 'Register Failure'
      },
      resetPwd: {
        title: 'Reset Password',
        success: 'Reset Password Success',
        failure: 'Reset Password Failure'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      }
    },
    about: {
      title: 'About',
      introduction: `SoybeanAdmin is an elegant and powerful admin template, based on the latest front-end technology stack, including Vue3, Vite5, TypeScript, Pinia and UnoCSS. It has built-in rich theme configuration and components, strict code specifications, and an automated file routing system. In addition, it also uses the online mock data solution based on ApiFox. SoybeanAdmin provides you with a one-stop admin solution, no additional configuration, and out of the box. It is also a best practice for learning cutting-edge technologies quickly.`,
      projectInfo: {
        title: 'Project Info',
        version: 'Version',
        latestBuildTime: 'Latest Build Time',
        githubLink: 'Github Link',
        previewLink: 'Preview Link'
      },
      prdDep: 'Production Dependency',
      devDep: 'Development Dependency'
    },
    home: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: 'Good morning, {userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃!',
      todayOrders: "Today's Orders",
      todayMatchRate: "Today's Match Rate",
      newUsers: "New Users Today",
      orderCount: "Order Count",
      revenue: "Revenue",
      activeUsers: "Active Users",
      userDistribution: "User Distribution",
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      todayOrderCount: "Today's Order Count",
      todayRevenue: "Today's Revenue",
      activeDrivers: "Active Drivers",
      activePassengers: "Active Passengers",
      projectNews: {
        title: 'System News',
        moreNews: 'More News',
        desc1: 'Carpooling system added multi-person carpooling, supporting 3+ people!',
        desc2: "Today's order count exceeded 1,000, reaching a new record!",
        desc3: "Admin approved 50 new drivers, expanding the driver team.",
        desc4: "System maintenance scheduled for March 21, 2025, at midnight. Please notify users in advance.",
        desc5: "New user registrations reached 500, carpooling service widely welcomed!"
      },
      creativity: 'Creativity'
    },
    function: {
      tab: {
        tabOperate: {
          title: 'Tab Operation',
          addTab: 'Add Tab',
          addTabDesc: 'To about page',
          closeTab: 'Close Tab',
          closeCurrentTab: 'Close Current Tab',
          closeAboutTab: 'Close "About" Tab',
          addMultiTab: 'Add Multi Tab',
          addMultiTabDesc1: 'To MultiTab page',
          addMultiTabDesc2: 'To MultiTab page(with query params)'
        },
        tabTitle: {
          title: 'Tab Title',
          changeTitle: 'Change Title',
          change: 'Change',
          resetTitle: 'Reset Title',
          reset: 'Reset'
        }
      },
      multiTab: {
        routeParam: 'Route Param',
        backTab: 'Back function_tab'
      },
      toggleAuth: {
        toggleAccount: 'Toggle Account',
        authHook: 'Auth Hook Function `hasAuth`',
        superAdminVisible: 'Super Admin Visible',
        adminVisible: 'Admin Visible',
        adminOrUserVisible: 'Admin and User Visible'
      },
      request: {
        repeatedErrorOccurOnce: 'Repeated Request Error Occurs Once',
        repeatedError: 'Repeated Request Error',
        repeatedErrorMsg1: 'Custom Request Error 1',
        repeatedErrorMsg2: 'Custom Request Error 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: 'Captcha Send',
        autoRequest: 'Auto Request',
        visibilityRequestTips: 'Automatically request when switching browser window',
        pollingRequestTips: 'It will request every 3 seconds',
        networkRequestTips: 'Automatically request after network reconnecting',
        refreshTime: 'Refresh Time',
        startRequest: 'Start Request',
        stopRequest: 'Stop Request',
        requestCrossComponent: 'Request Cross Component',
        triggerAllRequest: 'Manually Trigger All Automated Requests'
      }
    },
    manage: {
      common: {
        status: {
          enable: 'Enable',
          disable: 'Disable'
        }
      },
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleCode: 'Role Code',
        roleStatus: 'Role Status',
        roleDesc: 'Role Description',
        menuAuth: 'Menu Auth',
        buttonAuth: 'Button Auth',
        form: {
          roleName: 'Please enter role name',
          roleCode: 'Please enter role code',
          roleStatus: 'Please select role status',
          roleDesc: 'Please enter role description'
        },
        addRole: 'Add Role',
        editRole: 'Edit Role'
      },
      user: {
        id: 'ID',
        title: 'User List',
        userName: 'User Name',
        userGender: 'Gender',
        nickName: 'Nick Name',
        userPhone: 'Phone Number',
        userEmail: 'Email',
        userStatus: 'User Status',
        userRole: 'User Role',
        rating: 'Rating',
        defaultPaymentMethod: 'Default Payment Method',
        licensePlate: "License Plate",
        vehicleModel: "Vehicle Model",
        status: {
          offline: 'Offline',
          online: 'Online',
          locked: 'Locked',
        },
        paymentMethod: {
          wechat: 'wechat',
          alipay: 'alipay',
          bank: 'card_bank'
        },
        form: {
          userName: 'Please enter user name',
          userGender: 'Please select gender',
          nickName: 'Please enter nick name',
          userPhone: 'Please enter phone number',
          userEmail: 'Please enter email',
          userStatus: 'Please select user status',
          userRole: 'Please select user role',
          idNumber: 'ID',
          birthDate: 'BirthDay',
          password: 'Password',
          defaultPaymentMethod: 'Default Payment Method',
          usernameRequired: 'Username is required',
          usernameLength: "Username length cannot exceed 20 characters",
          phoneRequired: "Please enter phone number",
          phoneInvalid: "Phone number is required",
          passwordRequired:"Password is required",
          passwordLength: "Password length must be between 6 and 20 characters",
          nameRequired: "Nickname is required",
          nameLength: "Nickname length must be between 2 and 50 characters",
          idNumberInvalid: 'Please enter ID number',
          licensePlateInvalid: "Please enter vehicle model",
          vehicleModelLength:"Vehicle model length cannot exceed 50 characters"
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        gender: {
          male: 'Male',
          female: 'Female',
          other: 'Orther'
        },
        messages: {
          addSuccess: "User added successfully",
          updateSuccess: "User updated successfully",
          operationFailed: "Operation failed",
          deleteSuccess: "Delete user successfully",
          deleteFailed: "Delete user failed",
          batchDeleteSuccess: "Batch delete user successfully",
          batchDeletePartialSuccess: "Batch delete completed, but some records failed: {failedIds}",
          batchDeleteFailed: "Batch delete user failed",
        }
      },
      menu: {
        home: 'Home',
        title: 'Menu List',
        id: 'ID',
        parentId: 'Parent ID',
        menuType: 'Menu Type',
        menuName: 'Menu Name',
        routeName: 'Route Name',
        routePath: 'Route Path',
        pathParam: 'Path Param',
        layout: 'Layout Component',
        page: 'Page Component',
        i18nKey: 'I18n Key',
        icon: 'Icon',
        localIcon: 'Local Icon',
        iconTypeTitle: 'Icon Type',
        order: 'Order',
        constant: 'Constant',
        keepAlive: 'Keep Alive',
        href: 'Href',
        hideInMenu: 'Hide In Menu',
        activeMenu: 'Active Menu',
        multiTab: 'Multi Tab',
        fixedIndexInTab: 'Fixed Index In Tab',
        query: 'Query Params',
        button: 'Button',
        buttonCode: 'Button Code',
        buttonDesc: 'Button Desc',
        menuStatus: 'Menu Status',
        form: {
          home: 'Please select home',
          menuType: 'Please select menu type',
          menuName: 'Please enter menu name',
          routeName: 'Please enter route name',
          routePath: 'Please enter route path',
          pathParam: 'Please enter path param',
          page: 'Please select page component',
          layout: 'Please select layout component',
          i18nKey: 'Please enter i18n key',
          icon: 'Please enter iconify name',
          localIcon: 'Please enter local icon name',
          order: 'Please enter order',
          keepAlive: 'Please select whether to cache route',
          href: 'Please enter href',
          hideInMenu: 'Please select whether to hide menu',
          activeMenu: 'Please select route name of the highlighted menu',
          multiTab: 'Please select whether to support multiple tabs',
          fixedInTab: 'Please select whether to fix in the tab',
          fixedIndexInTab: 'Please enter the index fixed in the tab',
          queryKey: 'Please enter route parameter Key',
          queryValue: 'Please enter route parameter Value',
          button: 'Please select whether it is a button',
          buttonCode: 'Please enter button code',
          buttonDesc: 'Please enter button description',
          menuStatus: 'Please select menu status'
        },
        addMenu: 'Add Menu',
        editMenu: 'Edit Menu',
        addChildMenu: 'Add Child Menu',
        type: {
          directory: 'Directory',
          menu: 'Menu'
        },
        iconType: {
          iconify: 'Iconify Icon',
          local: 'Local Icon'
        }
      },
      order: {
        title: 'Order Management',
        // 统计相关
        stats: {
          totalOrders: 'Total Orders',
          totalRevenue: 'Total Revenue',
          avgMatchRate: 'Average Match Rate',
          orderCount: 'Order Count',
          revenue: 'Revenue'
        },
        // 筛选条件
        filter: {
          status: 'Status',
          dateStart: 'From',
          dateRange: '~',
          dateEnd: 'To',
          orderNumber: 'Order Number',
          filter: 'Filter',
          reset: 'Reset',
          statusOptions: {
            all: 'All',
            pending: 'Pending',
            matched: 'Matched',
            confirmed: 'Confirmed',
            cancelled: 'Cancelled',
            completed: 'Completed'
          }
        },
        // 表格列
        table: {
          orderNumber: 'Order Number',
          status: 'Run Status',
          paymentStatus: 'Payment Status',
          totalPrice: 'Amount',
          createdAt: 'Created At',
          actions: 'Actions',
          viewDetails: 'View Details',
          updateStatus: 'Update Status',
          passenger: 'Passenger',
          driver: 'Driver',
        },
        // 订单详情
        details: {
          title: 'Order Details',
          orderNumber: 'Order Number',
          status: 'Status',
          startLocation: 'Start Location',
          endLocation: 'End Location',
          requestedTime: 'Requested Time',
          seatCount: 'Seat Count',
          totalPrice: 'Amount',
          paymentStatus: 'Payment Status',
          paymentMethod: 'Payment Method',
          paymentTime: 'Payment Time',
          passenger: 'Passenger',
          driver: 'Driver',
          createdAt: 'Created At',
          cancelReason: 'Cancel Reason'
        },
        // 状态调整
        statusDialog: {
          title: 'Update Order Status',
          status: 'Status',
          cancelReason: 'Cancel Reason',
          cancelReasonPlaceholder: 'Please enter cancel reason',
          confirm: 'Confirm',
          cancel: 'Cancel'
        },
        // 操作提示
        messages: {
          fetchOrdersFailed: 'Failed to fetch order list',
          fetchDetailsFailed: 'Failed to fetch order details',
          updateStatusSuccess: 'Status updated successfully',
          updateStatusFailed: 'Failed to update status',
          noOrders: 'No orders',
          cancelReasonRequired: 'Please provide a cancel reason',
          orderCancelledCannotModify: 'Order has been cancelled and cannot be modified', // 新增
        },
        actions: {
          viewDetails: 'View Details',
          adjustStatus: 'Adjust Status'
        },
        status: {
          pending: 'Pending',
          matched: 'Matched',
          confirmed: 'Confirmed',
          cancelled: 'Cancelled',
          completed: 'Completed'
        },
      },
      review: {
        orderNumber: "Order Number",
        reviewer: 'Reviewer',
        reviewee: 'Reviewee',
        reviewerId: 'Reviewer ID',
        revieweeId: 'Reviewee ID',
        reviewType: 'Review Type',
        rating: 'Rating',
        content: 'Review Content',
        createdAt: 'Review Time',
        audit: 'Audit',
        isAnonymous: 'Anonymous',
        reason: 'Reason',
        type: {
          PToD: 'Passenger To Driver',
          DToP: 'Driver To Passenger',
        },
        status: {
          title: 'Review Status',
          pending: 'Pending Review',
          under_review: 'Under Review',
          completed: 'Reviewed',
          rejected: 'Review Deleted',
        },
        messages: {
          deleteSuccess: 'Delete Success',
          auditSuccess: 'Audit Success',
          operationFailed: 'Operate failed',
        },
        form: {
          statusRequired: "Please select audit status",
          statusInvalid: "Status must be either approved or rejected",
          reasonRequired: "Please enter a reason",
          reasonMinLength: "Reason must be at least 2 characters",
          reasonMaxLength: "Reason must not exceed 500 characters",
        }
      },
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, including letters, numbers, and underscores'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },
  datatable: {
    itemCount: 'Total {total} items'
  }
};

export default local;
