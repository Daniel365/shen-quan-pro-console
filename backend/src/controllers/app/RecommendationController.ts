/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 个性化推荐控制器
 */
import { Activity, Tag, User, UserTag } from '@/models/app';
import { TagAnalysisService } from '@/services/TagAnalysisService';
import { Request, Response } from 'express';

/**
 * 推荐控制器
 */
export class RecommendationController {
  /**
   * 获取个性化活动推荐
   */
  static async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const { account_uuid } = req.accountInfo! || {};
      const { limit = 10 } = req.body;

      if (!account_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      // 获取推荐活动列表
      const recommendations = await TagAnalysisService.recommendActivities(account_uuid, limit);

      // 获取活动详情
      const activityIds = recommendations.map((rec) => rec.activity_uuid);
      const activities = await Activity.findAll({
        where: { uuid: activityIds },
        attributes: ['uuid', 'title', 'base_price', 'location', 'start_time'],
      });

      // 构建响应数据
      const responseData = recommendations.map((rec) => {
        const activity = activities.find((a) => a.uuid === rec.activity_uuid);
        return {
          activity: activity ? activity.toJSON() : null,
          recommendation_score: rec.score,
          matched_tags: rec.matched_tags,
          reason: rec.reason,
        };
      });

      return res.responseBuilder.success({
        recommendations: responseData,
        total_count: responseData.length,
      });
    } catch (error) {
      console.error('Get recommendations failed:', error);
      return res.responseBuilder.error('recommendation.failed', 500);
    }
  }

  /**
   * 获取用户兴趣分析报告
   */
  static async getUserInterestReport(req: Request, res: Response) {
    try {
      const { account_uuid } = req.accountInfo! || {};

      if (!account_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      const report = await TagAnalysisService.getUserInterestReport(account_uuid);

      return res.responseBuilder.success({
        report,
      });
    } catch (error) {
      console.error('Get interest report failed:', error);
      return res.responseBuilder.error('interest.reportFailed', 500);
    }
  }

  /**
   * 触发智能标签分析
   */
  static async triggerAutoTagging(req: Request, res: Response) {
    try {
      const { user_uuid } = req.body;

      if (!user_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      await TagAnalysisService.autoTagUser(user_uuid);

      return res.responseBuilder.success(
        {
          message: '智能标签分析完成',
        },
        'recommendation.autoTagSuccess'
      );
    } catch (error) {
      console.error('Auto tagging failed:', error);
      return res.responseBuilder.error('recommendation.autoTagFailed', 500);
    }
  }

  /**
   * 获取热门活动推荐（无个性化）
   */
  static async getHotRecommendations(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.body;

      // 获取热门活动 - 现在需要通过订单表统计报名人数
      const hotActivities = await Activity.findAll({
        where: { status: 1 },
        order: [
          ['created_at', 'DESC'], // 按创建时间排序
        ],
        limit,
        attributes: ['uuid', 'title', 'base_price', 'location', 'start_time'],
      });

      return res.responseBuilder.success({
        recommendations: hotActivities.map((activity) => ({
          activity: activity.toJSON(),
          recommendation_score: 0.5, // 基础热度分
          matched_tags: [],
          reason: '热门活动推荐',
        })),
        total_count: hotActivities.length,
      });
    } catch (error) {
      console.error('Get hot recommendations failed:', error);
      return res.responseBuilder.error('recommendation.hotFailed', 500);
    }
  }

  /**
   * 获取基于标签的相似用户推荐
   */
  static async getSimilarUsers(req: Request, res: Response) {
    try {
      const { user_uuid, limit = 5 } = req.body;

      if (!user_uuid) {
        return res.responseBuilder.error('user.uuidRequired', 400);
      }

      // 获取用户标签权重
      const userTagWeights = await TagAnalysisService.calculateUserTagWeights(user_uuid);
      const userTagIds = userTagWeights.map((tag) => tag.tag_uuid);

      if (userTagIds.length === 0) {
        return res.responseBuilder.success({
          similar_users: [],
          message: '用户暂无标签，无法推荐相似用户',
        });
      }

      const similarUserTags = await UserTag.findAll({
        where: {
          tag_uuid: userTagIds,
          user_uuid: { [Symbol.for('ne')]: user_uuid }, // 排除自己
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['uuid', 'username', 'avatar'],
          },
          {
            model: Tag,
            as: 'tag',
            attributes: ['uuid', 'name'],
          },
        ],
        limit: limit * 3, // 多查一些用于去重
      });

      // 按用户分组并计算相似度
      const userSimilarity: Record<
        string,
        {
          user: any;
          commonTags: string[];
          similarityScore: number;
        }
      > = {};

      similarUserTags.forEach((userTag) => {
        const user = (userTag as any).user;
        const tag = (userTag as any).tag;

        if (user && tag) {
          if (!userSimilarity[user.uuid]) {
            userSimilarity[user.uuid] = {
              user,
              commonTags: [],
              similarityScore: 0,
            };
          }

          userSimilarity[user.uuid].commonTags.push(tag.name);
          // 相似度得分基于共同标签数量
          userSimilarity[user.uuid].similarityScore =
            userSimilarity[user.uuid].commonTags.length / userTagIds.length;
        }
      });

      // 按相似度排序并限制数量
      const similarUsers = Object.values(userSimilarity)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit)
        .map((item) => ({
          user: item.user,
          common_tags: item.commonTags,
          similarity_score: item.similarityScore,
        }));

      return res.responseBuilder.success({
        similar_users: similarUsers,
        total_count: similarUsers.length,
      });
    } catch (error) {
      console.error('Get similar users failed:', error);
      return res.responseBuilder.error('recommendation.similarUsersFailed', 500);
    }
  }
}
