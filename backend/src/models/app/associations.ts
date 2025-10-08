/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: App models associations
 */

import {
  Activity,
  ActivityTranslation,
  Order,
  ProfitRecord,
  Role,
  Tag,
  TagTranslation,
  User,
  UserInvite,
  UserTag,
  PaymentRecord,
  RefundRecord,
  MembershipCard,
  MembershipCardTranslation,
  OrderMembershipCard,
} from './index';

// user - 邀请
UserInvite.belongsTo(User, {
  foreignKey: 'user_uuid',
  targetKey: 'uuid',
  as: 'user',
});

UserInvite.belongsTo(User, {
  foreignKey: 'inviter_uuid',
  targetKey: 'uuid',
  as: 'inviter',
});

// Activity - Order associations
Activity.hasMany(Order, {
  foreignKey: 'target_uuid',
  as: 'orders',
});

Order.belongsTo(Activity, {
  foreignKey: 'target_uuid',
  as: 'activity',
});

// User - Order associations
User.hasMany(Order, {
  foreignKey: 'orderer_uuid',
  as: 'orders',
});

Order.belongsTo(User, {
  foreignKey: 'orderer_uuid',
  as: 'orderer',
});

// Order - ProfitRecord associations
Order.hasOne(ProfitRecord, {
  foreignKey: 'order_uuid',
  as: 'profitRecord',
});

ProfitRecord.belongsTo(Order, {
  foreignKey: 'order_uuid',
  as: 'order',
});

// Activity - ProfitRecord associations
Activity.hasMany(ProfitRecord, {
  foreignKey: 'activity_uuid',
  as: 'profitRecords',
});

ProfitRecord.belongsTo(Activity, {
  foreignKey: 'activity_uuid',
  as: 'activity',
});

// User - ProfitRecord associations (user)
User.hasMany(ProfitRecord, {
  foreignKey: 'user_uuid',
  as: 'userProfitRecords',
});

ProfitRecord.belongsTo(User, {
  foreignKey: 'user_uuid',
  as: 'user',
});

// User - UserTag associations
User.hasMany(UserTag, {
  foreignKey: 'user_uuid',
  as: 'userTags',
});

UserTag.belongsTo(User, {
  foreignKey: 'user_uuid',
  as: 'user',
});

// Tag - UserTag associations
Tag.hasMany(UserTag, {
  foreignKey: 'tag_uuid',
  as: 'userTags',
});

UserTag.belongsTo(Tag, {
  foreignKey: 'tag_uuid',
  as: 'tag',
});

// Activity - ActivityTranslation associations
Activity.hasMany(ActivityTranslation, {
  foreignKey: 'activity_uuid',
  as: 'translations',
});

ActivityTranslation.belongsTo(Activity, {
  foreignKey: 'activity_uuid',
  as: 'activity',
});

// Tag - TagTranslation associations
Tag.hasMany(TagTranslation, {
  foreignKey: 'tag_uuid',
  as: 'tag_translations',
});

TagTranslation.belongsTo(Tag, {
  foreignKey: 'tag_uuid',
  as: 'tag',
});

// Order - PaymentRecord associations
Order.hasMany(PaymentRecord, {
  foreignKey: 'order_uuid',
  as: 'paymentRecords',
});

PaymentRecord.belongsTo(Order, {
  foreignKey: 'order_uuid',
  as: 'order',
});

// Order - RefundRecord associations
Order.hasMany(RefundRecord, {
  foreignKey: 'order_uuid',
  as: 'refundRecords',
});

RefundRecord.belongsTo(Order, {
  foreignKey: 'order_uuid',
  as: 'order',
});

// Order - OrderMembershipCard associations
Order.hasOne(OrderMembershipCard, {
  foreignKey: 'order_uuid',
  as: 'membershipCard',
});

OrderMembershipCard.belongsTo(Order, {
  foreignKey: 'order_uuid',
  as: 'order',
});

// Role - OrderMembershipCard associations
OrderMembershipCard.belongsTo(Role, {
  foreignKey: 'role_uuid',
  as: 'role',
});

// Role - MembershipCard associations
MembershipCard.belongsTo(Role, {
  foreignKey: 'role_uuid',
  as: 'role',
});

// MembershipCard - MembershipCardTranslation associations
MembershipCard.hasMany(MembershipCardTranslation, {
  foreignKey: 'membership_card_uuid',
  as: 'translations',
});

MembershipCardTranslation.belongsTo(MembershipCard, {
  foreignKey: 'membership_card_uuid',
  as: 'membershipCard',
});

console.log('App models associations initialized');
