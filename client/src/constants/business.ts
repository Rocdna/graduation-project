import { transformRecordToOption } from '@/utils/common';

export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  'online': 'page.manage.user.status.online',
  'offline': 'page.manage.user.status.offline',
  'locked': 'page.manage.user.status.locked'
};

export const paymentMethodRecord = {
  'wechat': 'page.manage.user.paymentMethod.wechat',
  'alipay': 'page.manage.user.paymentMethod.alipay',
  'bank': 'page.manage.user.paymentMethod.bank'
};

export const reviewTypeRecord = {
  "passenger_to_driver": 'page.manage.review.type.PToD',
  "driver_to_passenger": 'page.manage.review.type.DToP'
}
export const reviewStatusRecord = {
  "pending": 'page.manage.review.status.pending',
  "under_review": 'page.manage.review.status.under_review',
  "completed": 'page.manage.review.status.completed',
  "rejected": 'page.manage.review.status.rejected'
}

export const reviewAuditRecord = {
  "completed": 'page.manage.review.status.completed',
  "rejected": 'page.manage.review.status.rejected'
}

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

export const defaultPaymentMethodOptions = transformRecordToOption(paymentMethodRecord);

export const reviewTypeRecordOptions = transformRecordToOption(reviewTypeRecord);

export const reviewStatusRecordOptions = transformRecordToOption(reviewStatusRecord);

export const reviewAuditRecordOptions = transformRecordToOption(reviewAuditRecord);

export const userGenderRecord: Record<Api.SystemManage.UserGender, App.I18n.I18nKey> = {
  'male': 'page.manage.user.gender.male',
  'female': 'page.manage.user.gender.female',
  'other': 'page.manage.user.gender.other'
};

export const userGenderOptions = transformRecordToOption(userGenderRecord);

export const menuTypeRecord: Record<Api.SystemManage.MenuType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.type.directory',
  '2': 'page.manage.menu.type.menu'
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

export const menuIconTypeRecord: Record<Api.SystemManage.IconType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.iconType.iconify',
  '2': 'page.manage.menu.iconType.local'
};

export const menuIconTypeOptions = transformRecordToOption(menuIconTypeRecord);
