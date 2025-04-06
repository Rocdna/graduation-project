import type {
  LocationQueryRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteLocationRaw,
  Router
} from 'vue-router';
import type { RouteKey, RoutePath } from '@elegant-router/types';
import { getRouteName } from '@/router/elegant/transform';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';
import { localStg } from '@/utils/storage';

/**
 * 创建路由守卫
 *
 * @param router router instance
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const location = await initRoute(to);
    if (location) {
      next(location);
      return;
    }

    const rootRoute: RouteKey = 'root';
    const loginRoute: RouteKey = 'login';
    const systemRoute: RouteKey = 'system';
    const noAuthorizationRoute: RouteKey = '403';

    const isLogin = Boolean(localStg.get('token'));
    const needLogin = !to.meta.constant;
    const routeRoles = to.meta.roles || [];
    // 用户权限
    const userRole = localStg.get('role') || 'visitor';
    // 该页面是否有角色权限，没有角色权限直接放行
    const hasAuth = !routeRoles.length || routeRoles.includes(userRole as string);  


    /** 未登录 */
    // 如果是已登录但访问的是登录页，则切换到根页面
    if (to.name === loginRoute && isLogin) {
      if (userRole === 'admin') {
        next({ name: systemRoute });      // 管理员默认跳到 /system
      } else {
        next({ name: rootRoute });        // 乘客/司机默认跳到 /根
      }
      return;
    }


    // 如果路由不需要登录,且未登录直接通过，如果已登录但是无权限
    if (!needLogin && hasAuth) {
      handleRouteSwitch(to, from, next);
      return;
    }
   
    
    // 路由需要登录，但是用户没有登录, 跳转到登录页面
    if (!isLogin) {
      next({ name: loginRoute, query: { redirect: to.fullPath } });
      return;
    }
    /** 已登录 */

    // 管理员限制：只能访问 /system 及其子路由
    if (userRole === 'admin') {
      if (!to.path.startsWith('/system')) {
        next({ name: noAuthorizationRoute });
        return;
      }
    }

    // 非管理员限制：不能访问 /system 及其子路由
    if (userRole !== 'admin' && to.path.startsWith('/system')) {
      next({ name: noAuthorizationRoute });
      return;
    }

    // 如果用户已登录但没有权限, 跳转到403页面
    if (!hasAuth) {
      next({ name: noAuthorizationRoute });
      return;
    }

    // 正常情况
    handleRouteSwitch(to, from, next);
  });
}

/**
 * 初始化路由
 *
 * @param to to route
 */
async function initRoute(to: RouteLocationNormalized): Promise<RouteLocationRaw | null> {
  const routeStore = useRouteStore();
  const notFoundRoute: RouteKey = 'not-found';
  const isNotFoundRoute = to.name === notFoundRoute;

  // 如果常量路由未初始化，就初始化常量路由
  if (!routeStore.isInitConstantRoute) {
    await routeStore.initConstantRoute();

    // the route is captured by the "not-found" route because the constant route is not initialized
    // after the constant route is initialized, redirect to the original route
    const path = to.fullPath;
    const location: RouteLocationRaw = {
      path,
      replace: true,
      query: to.query,
      hash: to.hash
    };

    return location;
  }

  const isLogin = Boolean(localStg.get('token'));


  if (!isLogin) {
    // 用户没有登录且是常量路由 但不是 not-found 路由, 允许通过
    if (to.meta.constant && !isNotFoundRoute) {
      routeStore.onRouteSwitchWhenNotLoggedIn();
      return null;
    }

    // 如果用户未登录, 跳转到登录页
    const loginRoute: RouteKey = 'login';
    const query = getRouteQueryOfLoginRoute(to, routeStore.routeHome);

    const location: RouteLocationRaw = {
      name: loginRoute,
      query
    };
    return location;
  }

  if (!routeStore.isInitAuthRoute) {
    // initialize the auth route
    await routeStore.initAuthRoute();

    // the route is captured by the "not-found" route because the auth route is not initialized
    // after the auth route is initialized, redirect to the original route
    if (isNotFoundRoute) {
      const rootRoute: RouteKey = 'root';
      const path = to.redirectedFrom?.name === rootRoute ? '/' : to.fullPath;

      const location: RouteLocationRaw = {
        path,
        replace: true,
        query: to.query,
        hash: to.hash
      };

      return location;
    }
  }

  routeStore.onRouteSwitchWhenLoggedIn();

  // the auth route is initialized
  // 如果不是 "not-found" 路由, 允许通过
  if (!isNotFoundRoute) {
    return null;
  }

  // it is captured by the "not-found" route, then check whether the route exists
  const exist = await routeStore.getIsAuthRouteExist(to.path as RoutePath);
  const noPermissionRoute: RouteKey = '403';
  if (exist) {
    const location: RouteLocationRaw = {
      name: noPermissionRoute
    };
    return location;
  }
  return null;
}

function handleRouteSwitch(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  // route with href
  if (to.meta.href) {
    window.open(to.meta.href, '_blank');
    next({ path: from.fullPath, replace: true, query: from.query, hash: to.hash });
    return;
  }
  next();
}

function getRouteQueryOfLoginRoute(to: RouteLocationNormalized, routeHome: RouteKey) {
  const loginRoute: RouteKey = 'login';
  const redirect = to.fullPath;
  const [redirectPath, redirectQuery] = redirect.split('?');
  const redirectName = getRouteName(redirectPath as RoutePath);

  const isRedirectHome = routeHome === redirectName;

  const query: LocationQueryRaw = to.name !== loginRoute && !isRedirectHome ? { redirect } : {};

  if (isRedirectHome && redirectQuery) {
    query.redirect = `/?${redirectQuery}`;
  }

  return query;
}
