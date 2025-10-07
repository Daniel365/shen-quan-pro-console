import { Menu } from '@/models/system';
import { Request, Response } from 'express';

import { buildWhereCondition } from '@/utils/database';
import { buildMenuList, buildMenuTree } from '@/utils/menu';
// decorators
import { IgnoreLog } from '@/decorators/autoLog';

export class MenuController {
  // 获取菜单树
  static async treeList(req: Request, res: Response) {
    try {
      const menus = await Menu.findAll({
        // where: { visible_status: 1 },
        order: [['sort', 'ASC']],
      });

      return res.responseBuilder.success({
        list: buildMenuTree(menus),
      });
    } catch (error) {
      return res.responseBuilder.error('common.serverError', 500);
    }
  }
  // 获取菜单列表
  @IgnoreLog()
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, ['name', 'type', 'visible_status']);

      const menus = await Menu.findAll({
        where,
        order: [['sort', 'ASC']],
      });

      return res.responseBuilder.success({
        list: buildMenuList(menus),
      });
    } catch (error) {
      return res.responseBuilder.error('common.serverError', 500);
    }
  }

  // 创建菜单
  static async create(req: Request, res: Response) {
    try {
      const {
        parent_id,
        name,
        type,
        route_name,
        route_path,
        component,
        visible_status,
        keep_alive,
        sort,
        icon,
        permission,
      } = req.body;

      const menu = await Menu.create({
        parent_id: parent_id === 0 ? null : parent_id,
        name,
        type,
        route_name,
        route_path,
        component,
        visible_status,
        keep_alive,
        sort,
        icon,
        permission,
      });

      return res.responseBuilder.created({ id: menu.id }, 'menu.createSuccess');
    } catch (error) {
      console.log(error);
      return res.responseBuilder.error('menu.createFailed', 500);
    }
  }

  // 更新菜单
  static async update(req: Request, res: Response) {
    try {
      const {
        id,
        parent_id,
        name,
        type,
        route_name,
        route_path,
        component,
        visible_status,
        keep_alive,
        sort,
        icon,
        permission,
      } = req.body;

      await Menu.update(
        {
          parent_id: parent_id === 0 ? null : parent_id,
          name,
          type,
          route_name,
          route_path,
          component,
          visible_status,
          keep_alive,
          sort,
          icon,
          permission,
        },
        { where: { id } }
      );

      return res.responseBuilder.success({}, 'menu.updateSuccess');
    } catch (error) {
      console.log(error);
      return res.responseBuilder.error('menu.updateFailed', 500);
    }
  }

  // 删除菜单
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.body;
      await Menu.destroy({ where: { id } });
      return res.responseBuilder.success({}, 'menu.deleteSuccess');
    } catch (error) {
      return res.responseBuilder.error('menu.deleteFailed', 500);
    }
  }
}
