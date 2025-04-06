/* eslint-disable */
/* prettier-ignore */
// Generated by elegant-router
// Read more: https://github.com/soybeanjs/elegant-router

import type { GeneratedRoute } from '@elegant-router/types';

export const generatedRoutes: GeneratedRoute[] = [
  {
    name: '403',
    path: '/403',
    component: 'layout.blank$view.403',
    meta: {
      title: '403',
      i18nKey: 'route.403',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '404',
    path: '/404',
    component: 'layout.blank$view.404',
    meta: {
      title: '404',
      i18nKey: 'route.404',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: '500',
    path: '/500',
    component: 'layout.blank$view.500',
    meta: {
      title: '500',
      i18nKey: 'route.500',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'home',
    path: '/home',
    component: 'layout.bg$view.home',
    meta: {
      title: 'home',
      i18nKey: 'route.home',
      constant: true,
      roles: ['passenger', 'driver', 'visitor'],
      hideInMenu: true
    }
  },
  {
    name: 'iframe-page',
    path: '/iframe-page/:url',
    component: 'layout.base$view.iframe-page',
    props: true,
    meta: {
      title: 'iframe-page',
      i18nKey: 'route.iframe-page',
      hideInMenu: true
    }
  },
  {
    name: 'login',
    path: '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
    component: 'layout.blank$view.login',
    props: true,
    meta: {
      title: 'login',
      i18nKey: 'route.login',
      constant: true,
      hideInMenu: true
    }
  },
  {
    name: 'ride',
    path: '/ride',
    component: 'layout.bg',
    meta: {
      title: 'ride',
      i18nKey: 'route.ride',
      constant: false,
      hideInMenu: true,
      icon: 'mdi:racing-helmet'
    },
    children: [
      {
        name: 'ride_carpool',
        path: '/ride/carpool',
        component: 'view.ride_carpool',
        meta: {
          title: 'ride_carpool',
          roles: ['passenger'],
          i18nKey: 'route.ride_carpool'
        }
      },
      {
        name: 'ride_grab',
        path: '/ride/grab',
        component: 'view.ride_grab',
        meta: {
          title: 'ride_grab',
          roles: ['driver'],
          i18nKey: 'route.ride_grab'
        }
      },
      {
        name: 'ride_order',
        path: '/ride/order',
        component: 'view.ride_order',
        meta: {
          title: 'ride_order',
          roles: ['passenger', 'driver'],
          i18nKey: 'route.ride_order'
        }
      },
      {
        name: 'ride_profile',
        path: '/ride/profile',
        component: 'view.ride_profile',
        meta: {
          title: 'ride_profile',
          roles: ['passenger', 'driver'],
          i18nKey: 'route.ride_profile'
        }
      },
      {
        name: 'ride_review',
        path: '/ride/review',
        component: 'view.ride_review',
        meta: {
          title: 'ride_review',
          roles: ['passenger', 'driver'],
          i18nKey: 'route.ride_review'
        }
      }
    ]
  },
  {
    name: 'system',
    path: '/system',
    component: 'layout.base',
    redirect: '/system/home',
    meta: {
      title: 'system',
      i18nKey: 'route.system',
      constant: false,
      roles: ['admin'],
      icon: 'mdi-warehouse'
    },
    children: [
      {
        name: 'system_about',
        path: '/system/about',
        component: 'view.system_about',
        meta: {
          title: 'system_about',
          i18nKey: 'route.system_about',
          constant: false,
          order: 7,
          icon: 'mdi-information-outline'
        }
      },
      {
        name: 'system_home',
        path: '/system/home',
        component: 'view.system_home',
        meta: {
          title: 'system_home',
          i18nKey: 'route.system_home',
          constant: false,
          roles: ['admin'],
          order: 1,
          icon: 'mdi:view-dashboard'
        }
      },
      {
        name: 'system_manage',
        path: '/system/manage',
        meta: {
          title: 'system_manage',
          i18nKey: 'route.system_manage',
          constant: false,
          roles: ['admin'],
          order: 2,
          icon: 'mdi:cog'
        },
        children: [
          {
            name: 'system_manage_driver',
            path: '/system/manage/driver',
            component: 'view.system_manage_driver',
            meta: {
              title: 'system_manage_driver',
              i18nKey: 'route.system_manage_driver',
              icon: 'mdi:account-star-outline'
            }
          },
          {
            name: 'system_manage_order',
            path: '/system/manage/order',
            component: 'view.system_manage_order',
            meta: {
              title: 'system_manage_order',
              i18nKey: 'route.system_manage_order',
              icon: 'mdi:archive-outline'
            }
          },
          {
            name: 'system_manage_passenger',
            path: '/system/manage/passenger',
            component: 'view.system_manage_passenger',
            meta: {
              title: 'system_manage_passenger',
              i18nKey: 'route.system_manage_passenger',
              icon: 'mdi:account-supervisor-outline'
            }
          },
          {
            name: 'system_manage_review',
            path: '/system/manage/review',
            component: 'view.system_manage_review',
            meta: {
              title: 'system_manage_review',
              i18nKey: 'route.system_manage_review',
              icon: 'mdi:comment-account-outline'
            }
          }
        ]
      },
      {
        name: 'system_plugin',
        path: '/system/plugin',
        meta: {
          title: 'system_plugin',
          i18nKey: 'route.system_plugin',
          constant: false,
          roles: ['admin'],
          order: 4
        },
        children: [
          {
            name: 'system_plugin_barcode',
            path: '/system/plugin/barcode',
            component: 'view.system_plugin_barcode',
            meta: {
              title: 'system_plugin_barcode',
              i18nKey: 'route.system_plugin_barcode'
            }
          },
          {
            name: 'system_plugin_charts',
            path: '/system/plugin/charts',
            meta: {
              title: 'system_plugin_charts',
              i18nKey: 'route.system_plugin_charts'
            },
            children: [
              {
                name: 'system_plugin_charts_antv',
                path: '/system/plugin/charts/antv',
                component: 'view.system_plugin_charts_antv',
                meta: {
                  title: 'system_plugin_charts_antv',
                  i18nKey: 'route.system_plugin_charts_antv'
                }
              },
              {
                name: 'system_plugin_charts_echarts',
                path: '/system/plugin/charts/echarts',
                component: 'view.system_plugin_charts_echarts',
                meta: {
                  title: 'system_plugin_charts_echarts',
                  i18nKey: 'route.system_plugin_charts_echarts'
                }
              },
              {
                name: 'system_plugin_charts_vchart',
                path: '/system/plugin/charts/vchart',
                component: 'view.system_plugin_charts_vchart',
                meta: {
                  title: 'system_plugin_charts_vchart',
                  i18nKey: 'route.system_plugin_charts_vchart'
                }
              }
            ]
          },
          {
            name: 'system_plugin_copy',
            path: '/system/plugin/copy',
            component: 'view.system_plugin_copy',
            meta: {
              title: 'system_plugin_copy',
              i18nKey: 'route.system_plugin_copy'
            }
          },
          {
            name: 'system_plugin_editor',
            path: '/system/plugin/editor',
            meta: {
              title: 'system_plugin_editor',
              i18nKey: 'route.system_plugin_editor'
            },
            children: [
              {
                name: 'system_plugin_editor_markdown',
                path: '/system/plugin/editor/markdown',
                component: 'view.system_plugin_editor_markdown',
                meta: {
                  title: 'system_plugin_editor_markdown',
                  i18nKey: 'route.system_plugin_editor_markdown'
                }
              },
              {
                name: 'system_plugin_editor_quill',
                path: '/system/plugin/editor/quill',
                component: 'view.system_plugin_editor_quill',
                meta: {
                  title: 'system_plugin_editor_quill',
                  i18nKey: 'route.system_plugin_editor_quill'
                }
              }
            ]
          },
          {
            name: 'system_plugin_excel',
            path: '/system/plugin/excel',
            component: 'view.system_plugin_excel',
            meta: {
              title: 'system_plugin_excel',
              i18nKey: 'route.system_plugin_excel'
            }
          },
          {
            name: 'system_plugin_gantt',
            path: '/system/plugin/gantt',
            meta: {
              title: 'system_plugin_gantt',
              i18nKey: 'route.system_plugin_gantt'
            },
            children: [
              {
                name: 'system_plugin_gantt_dhtmlx',
                path: '/system/plugin/gantt/dhtmlx',
                component: 'view.system_plugin_gantt_dhtmlx',
                meta: {
                  title: 'system_plugin_gantt_dhtmlx',
                  i18nKey: 'route.system_plugin_gantt_dhtmlx'
                }
              },
              {
                name: 'system_plugin_gantt_vtable',
                path: '/system/plugin/gantt/vtable',
                component: 'view.system_plugin_gantt_vtable',
                meta: {
                  title: 'system_plugin_gantt_vtable',
                  i18nKey: 'route.system_plugin_gantt_vtable'
                }
              }
            ]
          },
          {
            name: 'system_plugin_icon',
            path: '/system/plugin/icon',
            component: 'view.system_plugin_icon',
            meta: {
              title: 'system_plugin_icon',
              i18nKey: 'route.system_plugin_icon'
            }
          },
          {
            name: 'system_plugin_map',
            path: '/system/plugin/map',
            component: 'view.system_plugin_map',
            meta: {
              title: 'system_plugin_map',
              i18nKey: 'route.system_plugin_map'
            }
          },
          {
            name: 'system_plugin_pdf',
            path: '/system/plugin/pdf',
            component: 'view.system_plugin_pdf',
            meta: {
              title: 'system_plugin_pdf',
              i18nKey: 'route.system_plugin_pdf'
            }
          },
          {
            name: 'system_plugin_pinyin',
            path: '/system/plugin/pinyin',
            component: 'view.system_plugin_pinyin',
            meta: {
              title: 'system_plugin_pinyin',
              i18nKey: 'route.system_plugin_pinyin'
            }
          },
          {
            name: 'system_plugin_print',
            path: '/system/plugin/print',
            component: 'view.system_plugin_print',
            meta: {
              title: 'system_plugin_print',
              i18nKey: 'route.system_plugin_print'
            }
          },
          {
            name: 'system_plugin_swiper',
            path: '/system/plugin/swiper',
            component: 'view.system_plugin_swiper',
            meta: {
              title: 'system_plugin_swiper',
              i18nKey: 'route.system_plugin_swiper'
            }
          },
          {
            name: 'system_plugin_tables',
            path: '/system/plugin/tables',
            meta: {
              title: 'system_plugin_tables',
              i18nKey: 'route.system_plugin_tables'
            },
            children: [
              {
                name: 'system_plugin_tables_vtable',
                path: '/system/plugin/tables/vtable',
                component: 'view.system_plugin_tables_vtable',
                meta: {
                  title: 'system_plugin_tables_vtable',
                  i18nKey: 'route.system_plugin_tables_vtable'
                }
              }
            ]
          },
          {
            name: 'system_plugin_typeit',
            path: '/system/plugin/typeit',
            component: 'view.system_plugin_typeit',
            meta: {
              title: 'system_plugin_typeit',
              i18nKey: 'route.system_plugin_typeit'
            }
          },
          {
            name: 'system_plugin_video',
            path: '/system/plugin/video',
            component: 'view.system_plugin_video',
            meta: {
              title: 'system_plugin_video',
              i18nKey: 'route.system_plugin_video'
            }
          }
        ]
      },
      {
        name: 'system_user-center',
        path: '/system/user-center',
        component: 'view.system_user-center',
        meta: {
          title: 'system_user-center',
          i18nKey: 'route.system_user-center',
          constant: false,
          roles: ['admin'],
          order: 6,
          icon: 'mdi:face-man-shimmer-outline'
        }
      }
    ]
  }
];
