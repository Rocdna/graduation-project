/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /** common search params of table */
    type CommonSearchParams = Pick<
      Common.PaginatingCommonParams,
      "current" | "size"
    >;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = "online" | "offline" | "locked";


    type PaymentMethod = "wechat" | "alipay" | "bank"

    /** common record */
    type CommonRecord<T = any> = {
      _id: string;
      /** record id */
      id: string;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | undefined;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    // 通知设置
    interface NotificationSettings {
      orderNotifications?: boolean;
      paymentNotifications?: boolean;
      reviewNotifications?: boolean;
      systemNotifications?: boolean;
    }

    // 用户资料
    interface UserProfile {
      name?: string;
      idNumber?: string;
      avatar?: string;
      birthDate?: string | Date;
      gender?: 'male'|'female'|'other';
      rating?: number;
      licensePlate?: string;
      vehicleModel?: string;
      defaultPaymentMethod?: string;
      status?: 'offline'|'online'|'locked';
    }

    // 用户全部信息
    interface UserInfo {
      _id: string;
      username: string;
      phone?: string;
      role: 'passenger' | 'admin' | 'driver' | 'visitor';
      lastLogin?: string | Date;
      profile?: UserProfile;
      notificationSettings?: NotificationSettings;
      bgEffect?: boolean;
      createdAt?: string | Date;
      updatedAt?: string | Date;
    }
  }






  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import("@elegant-router/types").ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import("@elegant-router/types").LastLevelRouteKey;
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<
      Common.PaginatingCommonParams,
      "current" | "size"
    >;

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, "roleName" | "roleCode" | "status"> &
        CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, "id" | "roleName" | "roleCode">;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     * - "3": "other"
     */
    type UserGender = "male" | "female" | "other";

    /** user */
    type User = Common.CommonRecord<{
      _id: string;
      /** user name */
      username: string;
      /** user pwd */
      password: string;
      /** user phone */
      phone: string;
      /** user role */
      role: string;
      /** real name */
      name: string;
      /** gender */
      gender: UserGender | undefined;
      /** rating */
      rating: number;
      /** status */
      status: 'online' | 'offline' | 'locked';
      /** default payment method (passenger only) */
      defaultPaymentMethod?: string;
      /** license plate (driver only) */
      licensePlate?: string;
      /** vehicle model (driver only) */
      vehicleModel?: string;
}>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<User, 'username' | 'phone'> & {
        gender?: 'male' | 'female' | 'other';
        status?: 'online' | 'offline' | 'locked';
        name?: string;
        ratingMin?: number;
        ratingMax?: number;
        licensePlate?: string; // driver only
        vehicleModel?: string; // driver only
      } & CommonSearchParams
    >;

    type ReviewParams = CommonType.RecordNullable<{
      /** order Id */
      orderId: string;
      /** rating */
      rating: number;
      /** review content */
      content: string;
      /** reviewer */
      reviewerId: string;
      /** reviewee */
      revieweeId: string;
      /** review type */
      reviewType: string;
      /** isAnonymous */
      isAnonymous: string;
      /**review status */
      status: "pending" | "under_review" | "completed" | "rejected";
    } & CommonSearchParams>;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = "1" | "2";

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = "1" | "2";

    type MenuPropsOfRoute = Pick<
      import("vue-router").RouteMeta,
      | "i18nKey"
      | "keepAlive"
      | "constant"
      | "order"
      | "href"
      | "hideInMenu"
      | "activeMenu"
      | "multiTab"
      | "fixedIndexInTab"
      | "query"
    >;

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };
  }
}
