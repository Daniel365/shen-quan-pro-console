/*
 * @Author: 350296245@qq.com
 * @Date: 2025-09-24
 * @Description: 消息通知控制器
 */
import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import { Notification, User, Role } from '@/models/system';
import { sseService } from '@/services/sseService';
import { buildWhereCondition, defaultListQuery, getPageInfoConfig } from '@/utils/database';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';


export class NotificationController {
  // SSE连接端点 - 用户接收消息
  static async connect(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      if (!uuid) {
        return res.responseBuilder.unauthorized('auth.unauthorized');
      }

      // 建立SSE连接
      sseService.addClient(uuid, res);
    } catch (error) {
      console.error('SSE连接错误:', error);
      return res.responseBuilder.error('notification.connectFailed', 500);
    }
  }

  // 管理员发送通知
  static async send(req: Request, res: Response) {
    try {
      const { title, content, type = 'info', receiver_uuid } = req.body;
      const { uuid: sender_uuid } = req?.accountInfo || {};

      // 参数验证
      if (!title || !content) {
        return res.responseBuilder.error('notification.titleContentRequired');
      }

      if (!['info', 'warning', 'error', 'success'].includes(type)) {
        return res.responseBuilder.error('notification.invalidType');
      }

      // 如果指定了接收者，验证用户是否存在
      if (receiver_uuid) {
        const receiver = await User.findOne({ where: { uuid: receiver_uuid } });
        if (!receiver) {
          return res.responseBuilder.error('user.notFound');
        }
      }

      // 创建通知记录
      const notification = await Notification.create({
        title,
        content,
        type,
        sender_uuid,
        receiver_uuid: receiver_uuid || null, // null表示全体用户
      });

      // 构造推送消息
      const messageData = {
        type: 'notification',
        data: {
          uuid: notification.uuid,
          title: notification.title,
          content: notification.content,
          notificationType: notification.type,
          created_at: notification.created_at,
        },
      };

      // 推送消息
      if (receiver_uuid) {
        // 发送给特定用户
        const sent = sseService.sendToUser(receiver_uuid, messageData);
        if (!sent) {
          console.log(`用户 ${receiver_uuid} 当前不在线，消息已保存到数据库`);
        }
      } else {
        // 广播给所有用户
        sseService.broadcast(messageData);

        // 为所有用户创建通知记录
        const allUsers = await User.findAll({
          attributes: ['uuid'],
          where: { uuid: { [Op.ne]: sender_uuid } }, // 排除发送者
        });

        const notificationRecords = allUsers.map((user) => ({
          title,
          content,
          type,
          sender_uuid,
          receiver_uuid: user.uuid,
        }));

        if (notificationRecords.length > 0) {
          await Notification.bulkCreate(notificationRecords);
        }
      }

      return res.responseBuilder.success(
        {
          uuid: notification.uuid,
          sent_count: receiver_uuid ? 1 : sseService.getOnlineUsersCount(),
        },
        'notification.sendSuccess'
      );
    } catch (error) {
      console.error('发送通知错误:', error);
      return res.responseBuilder.error('notification.sendFailed', 500);
    }
  }

  // 获取用户的通知列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};
      const reqBody = req.body;

      const where: any = buildWhereCondition(reqBody, [
        { field: 'title' },
        { field: 'type' },
        { field: 'is_read' },
      ]);

      // 添加接收者条件：接收者是当前用户或者是全体通知
      where[Op.or] = [{ receiver_uuid: uuid }, { receiver_uuid: null }];

      const { rows, count } = await Notification.findAndCountAll({
        where,
        attributes: [
          'uuid',
          'title',
          'content',
          'type',
          'is_read',
          'created_at',
          [Sequelize.col('sender.username'), 'sender_name'],
        ],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: [],
          },
        ],
        order: [['created_at', 'DESC']],
        ...defaultListQuery(reqBody),
      });

      const pageInfo = getPageInfoConfig({
        count,
        ...reqBody,
      });

      return res.responseBuilder.success({
        list: rows,
        pageInfo,
      });
    } catch (error) {
      console.error('获取通知列表错误:', error);
      return res.responseBuilder.error('notification.getListFailed', 500);
    }
  }

  // 标记通知为已读
  static async markAsRead(req: Request, res: Response) {
    try {
      const { uuid: notification_uuid } = req.body;
      const { uuid: user_uuid } = req?.accountInfo || {};

      if (!notification_uuid) {
        return res.responseBuilder.error('notification.idRequired');
      }

      // 查找通知并验证权限
      const notification = await Notification.findOne({
        where: {
          uuid: notification_uuid,
          [Op.or]: [{ receiver_uuid: user_uuid }],
        },
      });

      if (!notification) {
        return res.responseBuilder.notFound('notification.notFound');
      }

      // 更新为已读
      await notification.update({ is_read: true });

      return res.responseBuilder.success(
        { uuid: notification_uuid },
        'notification.markReadSuccess'
      );
    } catch (error) {
      console.error('标记已读错误:', error);
      return res.responseBuilder.error('notification.markReadFailed', 500);
    }
  }

  // 批量标记为已读
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      const updateCount = await Notification.update(
        { is_read: true },
        {
          where: {
            [Op.or]: [{ receiver_uuid: uuid }],
            is_read: false,
          },
        }
      );

      return res.responseBuilder.success(
        { updated_count: updateCount[0] },
        'notification.markAllReadSuccess'
      );
    } catch (error) {
      console.error('批量标记已读错误:', error);
      return res.responseBuilder.error('notification.markAllReadFailed', 500);
    }
  }

  // 获取未读通知数量
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const { uuid } = req?.accountInfo || {};

      const count = await Notification.count({
        where: {
          [Op.or]: [{ receiver_uuid: uuid }],
          is_read: false,
        },
      });

      return res.responseBuilder.success({ unread_count: count });
    } catch (error) {
      console.error('获取未读数量错误:', error);
      return res.responseBuilder.error('notification.getUnreadCountFailed', 500);
    }
  }

  // 删除通知（管理员）
  static async delete(req: Request, res: Response) {
    try {
      const { uuid } = req.body;

      if (!uuid) {
        return res.responseBuilder.error('notification.idRequired');
      }

      const notification = await Notification.findOne({ where: { uuid } });
      if (!notification) {
        return res.responseBuilder.notFound('notification.notFound');
      }

      await notification.destroy();

      return res.responseBuilder.success({ uuid }, 'notification.deleteSuccess');
    } catch (error) {
      console.error('删除通知错误:', error);
      return res.responseBuilder.error('notification.deleteFailed', 500);
    }
  }

  // 获取在线用户状态（管理员）
  static async getOnlineStatus(req: Request, res: Response) {
    try {
      const onlineUserUuids = sseService.getOnlineUsers();
      const onlineCount = sseService.getOnlineUsersCount();

      // 直接获取在线用户的详细信息
      let onlineUsers: any[] = [];
      if (onlineUserUuids.length > 0) {
        onlineUsers = await User.findAll({
          where: {
            uuid: onlineUserUuids,
          },
          attributes: [
            'uuid',
            'username',
            'email',
            'role_uuids',
            [Sequelize.col('role.name'), 'role_name'],
          ],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: [],
            },
          ],
          raw: true,
        });
      }

      return res.responseBuilder.success({
        onlineUsers,
        onlineCount: onlineCount,
      });
    } catch (error) {
      console.error('获取在线状态错误:', error);
      return res.responseBuilder.error('notification.getOnlineStatusFailed', 500);
    }
  }
}
