import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { SetupStoreId } from '@/enum';
import { useLoading } from '@sa/hooks';
import { fetchNotificationRead, fetchNotificationList, fetchDeleteNotification } from '@/service/api';

interface Notifications {
    id: string;
    recipientId: string;
    type: 'system' | 'order' | 'review' | 'trip' | 'payment' | 'order_matched' | 'order_confirmed' | 'order_cancelled' | 'order_completed';
    title: string;
    message: string;
    isRead: boolean;
    orderId: string;
    tripId: string;
    createdAt: string;
}

export const useNotificationStore = defineStore(SetupStoreId.Notification, () => {
    const { loading, startLoading, endLoading } = useLoading();
    const state = reactive({
        notifications: [] as Notifications[],
        unreadList: [] as Notifications[],
        noti: [] as Notifications[],        // 根据用户设置的通知
    });

    // 未读通知数量（计算属性）
    const unreadCount = computed(() => state.notifications.filter(n => !n.isRead).length);
    // 标记通知为已读
    async function markAsRead(notificationId: string) {
        const index = state.notifications.findIndex(n => n.id === notificationId);
        if (index === -1 || state.notifications[index].isRead) return; // 不存在或已读则跳过

        startLoading();
        try {
            const { error } = await fetchNotificationRead(notificationId);
            if (!error) {
                // 更新数组中的对象，确保响应性
                state.notifications[index] = { ...state.notifications[index], isRead: true };
            } else {
                console.error('标记已读失败:', error);
            }
        } catch (error) {
            console.error('标记已读异常:', error);
        } finally {
            endLoading();
        }
    }

    // 添加实时通知（配合 WebSocket）
    function addNotification(notification: Notifications) {
        if (!state.notifications.some(n => n.id === notification.id)) {
            state.notifications.unshift(notification); // 新通知插入顶部
        }
        // window.$message?.success(notification.message);
    }

    // 删除某个通知
    async function deleteNotification(notificationId: string) {
        startLoading();
        try {
            const { error } = await fetchDeleteNotification(notificationId);
            if (!error) {
                state.notifications = state.notifications.filter(n => n.id !== notificationId); // 删除本地通知
            } else {
                console.error('删除通知失败:', error);
            }
        } catch (error) {
            console.error('删除通知异常:', error);
        } finally {
            endLoading();
        }
    }

    // 获取通知列表
    async function getNotificationList() {
        startLoading();
        try {
            const { data, error } = await fetchNotificationList();
            if (!error && data) {
                Object.assign(state.notifications, data.notifications);
                state.unreadList = state.notifications.filter((item) => !item.isRead);
            }
        } catch (error) {
            console.error('获取通知列表异常:', error);
            state.notifications = [];
        } finally {
            endLoading();
        }
    }

    return {
        state,
        loading, // 暴露加载状态
        unreadCount, // 未读数量
        getNotificationList,
        markAsRead,
        deleteNotification,
        addNotification, // 用于 WebSocket 实时更新
    }
})