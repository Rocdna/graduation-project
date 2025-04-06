import { request } from '../request';


/**
 * 设置通知为可读
 * @param id  通知ID
 * @returns 更新后的通知信息
 */
export function fetchNotificationRead(id: string){
    return request({
      url: `/notifications/${id}/read`,
      method: 'patch',
    });
}


/**
 * 获取用户通知列表
 * @param id  用户ID
 * @returns 通知列表
 */
export function fetchNotificationList(){
    return request({
      url: `/notifications`,
      method: 'get',
    });
}


/**
 * 删除某个通知
 * @param id  通知ID
 * @returns 剩下的通知列表
 */
export function fetchDeleteNotification(id: string){
    return request({
      url: `/notifications/:id`,
      method: 'delete',
    });
}

