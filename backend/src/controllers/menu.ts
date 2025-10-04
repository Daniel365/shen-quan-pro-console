import { Request, Response } from "express";
import { Menu } from "../models/associations";
import { onSuccessResult } from "../utils/controllersResult";
import { ResParamsTypeEnum } from "../types/interfaceResult";
import { buildWhereCondition } from "../utils/database";

export class MenuController {
  // 构建菜单树
  private static buildTree(menus: any[]) {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
    });

    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      const newItem = {
        label: menuItem.name,
        value: menuItem.id,
        children: menuItem.children,
      };
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id).children.push(newItem);
      } else {
        rootMenus.push(newItem);
      }
    });

    return rootMenus;
  }
  // 获取菜单树
  static async treeList(req: Request, res: Response) {
    try {
      const menus = await Menu.findAll({
        where: { visible_status: 1 },
        order: [["sort", "ASC"]],
      });

      res.json(
        onSuccessResult(MenuController.buildTree(menus), {
          resType: ResParamsTypeEnum.LIST,
        })
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "服务器错误" });
    }
  }

  // 构建菜单列表
  private static buildList(menus: any[]) {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu.toJSON(), children: [] });
    });

    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      // 当父级id空时
      if (menuItem.parent_id === null) {
        menuItem.parent_id = 0;
      }
      if (menu.parent_id && menuMap.has(menu.parent_id)) {
        menuMap.get(menu.parent_id).children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus;
  }
  // 获取菜单列表
  static async list(req: Request, res: Response) {
    try {
      const reqBody = req.body;
      const where: any = buildWhereCondition(reqBody, [
        "name",
        "type",
        "visible_status",
      ]);

      const menus = await Menu.findAll({
        where,
        order: [["sort", "ASC"]],
      });

      res.json(
        onSuccessResult(MenuController.buildList(menus), {
          resType: ResParamsTypeEnum.LIST,
        })
      );
    } catch (error) {
      res.status(500).json({ code: 500, message: "服务器错误" });
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

      res.json(
        onSuccessResult({
          id: menu.id,
        })
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, message: "创建失败" });
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

      res.json(onSuccessResult({}));
    } catch (error) {
      console.log(error);
      res.status(500).json({ code: 500, message: "更新失败" });
    }
  }

  // 删除菜单
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.body;
      await Menu.destroy({ where: { id } });
      res.json(onSuccessResult({}));
    } catch (error) {
      res.status(500).json({ code: 500, message: "删除失败" });
    }
  }
}
