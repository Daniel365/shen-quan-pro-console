/*
 * @Author: 350296245@qq.com
 * @Date: 2025-10-05 00:00:00
 * @Description: 标签分析服务 - 用于大数据分析和个性化推荐
 */
import { Activity, Order, Tag, UserTag } from '@/models/app';
import { Op } from 'sequelize';

interface UserTagWeight {
  tag_uuid: string;
  tag_name: string;
  weight: number; // 0-1的权重值
  type: 'manual' | 'auto'; // 手动标签还是系统分析标签
}

interface ActivityTagScore {
  activity_uuid: string;
  score: number; // 匹配度得分
  matched_tags: string[]; // 匹配的标签列表
  reason: string; // 推荐原因
}

export class TagAnalysisService {
  /**
   * 计算用户标签权重
   * 考虑因素：
   * 1. 手动添加的标签（权重更高）
   * 2. 活动参与记录
   * 3. 浏览历史
   * 4. 社交关系
   */
  static async calculateUserTagWeights(user_uuid: string): Promise<UserTagWeight[]> {
    const weights: UserTagWeight[] = [];

    // 1. 获取用户手动添加的标签
    const manualTags = await UserTag.findAll({
      where: { user_uuid },
      include: [
        {
          model: Tag,
          as: 'tag',
          attributes: ['uuid', 'name'],
        },
      ],
    });

    // 手动标签基础权重
    manualTags.forEach((userTag) => {
      const tag = (userTag as any).tag;
      if (tag) {
        weights.push({
          tag_uuid: tag.uuid,
          tag_name: tag.name,
          weight: 0.8, // 手动标签高权重
          type: 'manual',
        });
      }
    });

    // 2. 基于活动参与记录分析标签偏好
    const activityTags = await this.analyzeActivityParticipation(user_uuid);
    weights.push(...activityTags);

    // 3. 基于浏览历史分析（如果有浏览记录功能）
    const viewTags = await this.analyzeViewHistory(user_uuid);
    weights.push(...viewTags);

    // 4. 基于社交关系分析
    const socialTags = await this.analyzeSocialConnections(user_uuid);
    weights.push(...socialTags);

    // 合并相同标签的权重，取最大值
    const mergedWeights = this.mergeTagWeights(weights);

    return mergedWeights.sort((a, b) => b.weight - a.weight);
  }

  /**
   * 基于活动参与记录分析标签偏好
   */
  private static async analyzeActivityParticipation(user_uuid: string): Promise<UserTagWeight[]> {
    const weights: UserTagWeight[] = [];

    // 获取用户参与的活动
    const userOrders = await Order.findAll({
      where: { orderer_uuid: user_uuid, order_type: 'activity' },
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['uuid', 'tags'],
        },
      ],
    });

    // 统计活动标签出现频率
    const tagFrequency: Record<string, number> = {};
    let totalActivities = 0;

    userOrders.forEach((order) => {
      const activity = (order as any).activity;
      if (activity && activity.tags) {
        totalActivities++;
        activity.tags.forEach((tagId: string) => {
          tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
        });
      }
    });

    // 获取标签详情并计算权重
    if (Object.keys(tagFrequency).length > 0) {
      const tags = await Tag.findAll({
        where: { uuid: { [Op.in]: Object.keys(tagFrequency) } },
      });

      tags.forEach((tag) => {
        const frequency = tagFrequency[tag.uuid];
        const weight = Math.min(0.6, (frequency / totalActivities) * 0.8); // 频率越高权重越高

        weights.push({
          tag_uuid: tag.uuid,
          tag_name: tag.name,
          weight,
          type: 'auto',
        });
      });
    }

    return weights;
  }

  /**
   * 基于浏览历史分析（简化版）
   */
  private static async analyzeViewHistory(user_uuid: string): Promise<UserTagWeight[]> {
    // 这里可以根据实际实现的浏览记录功能来扩展
    // 暂时返回空数组
    return [];
  }

  /**
   * 基于社交关系分析
   */
  private static async analyzeSocialConnections(user_uuid: string): Promise<UserTagWeight[]> {
    const weights: UserTagWeight[] = [];

    // 获取用户的好友或关注的人的标签
    // 简化实现：查找同一标签的其他用户
    const similarUsers = await UserTag.findAll({
      where: {
        user_uuid: { [Op.ne]: user_uuid },
      },
      include: [
        {
          model: Tag,
          as: 'tag',
          attributes: ['uuid', 'name'],
        },
      ],
      limit: 50, // 限制查询数量
    });

    // 统计标签在相似用户中的流行度
    const tagPopularity: Record<string, number> = {};
    let totalUsers = 0;

    similarUsers.forEach((userTag) => {
      const tag = (userTag as any).tag;
      if (tag) {
        totalUsers++;
        tagPopularity[tag.uuid] = (tagPopularity[tag.uuid] || 0) + 1;
      }
    });

    // 计算社交标签权重
    Object.keys(tagPopularity).forEach((tagId) => {
      const popularity = tagPopularity[tagId];
      const tag = similarUsers.find((ut) => (ut as any).tag?.uuid === tagId) as any;

      if (tag && tag.tag) {
        const weight = Math.min(0.4, (popularity / totalUsers) * 0.6);

        weights.push({
          tag_uuid: tagId,
          tag_name: tag.tag.name,
          weight,
          type: 'auto',
        });
      }
    });

    return weights;
  }

  /**
   * 合并相同标签的权重
   */
  private static mergeTagWeights(weights: UserTagWeight[]): UserTagWeight[] {
    const merged: Record<string, UserTagWeight> = {};

    weights.forEach((weight) => {
      if (!merged[weight.tag_uuid] || weight.weight > merged[weight.tag_uuid].weight) {
        merged[weight.tag_uuid] = weight;
      }
    });

    return Object.values(merged);
  }

  /**
   * 基于用户标签推荐活动
   */
  static async recommendActivities(user_uuid: string, limit = 10): Promise<ActivityTagScore[]> {
    const userTagWeights = await this.calculateUserTagWeights(user_uuid);
    const topTags = userTagWeights.slice(0, 5); // 取权重最高的5个标签

    if (topTags.length === 0) {
      // 如果没有标签，返回热门活动
      return await this.getPopularActivities(limit);
    }

    // 获取匹配标签的活动
    const matchingActivities = await Activity.findAll({
      where: {
        tags: {
          [Op.overlap]: topTags.map((tag) => tag.tag_uuid),
        },
        status: 1, // 只推荐启用的活动
      },
      limit,
    });

    // 计算每个活动的匹配度得分
    const scoredActivities: ActivityTagScore[] = [];

    for (const activity of matchingActivities) {
      const score = this.calculateActivityScore(activity, topTags);

      scoredActivities.push({
        activity_uuid: activity.uuid,
        score: score.totalScore,
        matched_tags: score.matchedTags,
        reason: this.generateRecommendationReason(score.matchedTags, topTags),
      });
    }

    // 按得分排序
    return scoredActivities.sort((a, b) => b.score - a.score);
  }

  /**
   * 计算活动匹配度得分
   */
  private static calculateActivityScore(
    activity: any,
    userTags: UserTagWeight[]
  ): {
    totalScore: number;
    matchedTags: string[];
  } {
    let totalScore = 0;
    const matchedTags: string[] = [];

    userTags.forEach((userTag) => {
      if (activity.tags && activity.tags.includes(userTag.tag_uuid)) {
        totalScore += userTag.weight;
        matchedTags.push(userTag.tag_name);
      }
    });

    // 添加活动热度因子
    const popularityFactor = Math.min(
      1,
      ((activity.regCount || 0) / (activity.regLimit || 1)) * 0.3
    );
    totalScore += popularityFactor;

    return { totalScore, matchedTags };
  }

  /**
   * 生成推荐原因
   */
  private static generateRecommendationReason(
    matchedTags: string[],
    userTags: UserTagWeight[]
  ): string {
    if (matchedTags.length === 0) return '热门活动推荐';

    const topMatchedTag = userTags.find((tag) => matchedTags.includes(tag.tag_name));

    if (matchedTags.length === 1) {
      return `根据您的"${matchedTags[0]}"兴趣推荐`;
    } else {
      return `与您的兴趣"${matchedTags.slice(0, 2).join('、')}"高度匹配`;
    }
  }

  /**
   * 获取热门活动（当没有用户标签时使用）
   */
  private static async getPopularActivities(limit: number): Promise<ActivityTagScore[]> {
    const popularActivities = await Activity.findAll({
      where: { status: 1 },
      order: [['regCount', 'DESC']],
      limit,
    });

    return popularActivities.map((activity) => ({
      activity_uuid: activity.uuid,
      score: 0.5, // 基础热度分
      matched_tags: [],
      reason: '热门活动推荐',
    }));
  }

  /**
   * 智能分析并自动为用户打标签
   */
  static async autoTagUser(user_uuid: string): Promise<void> {
    const userTagWeights = await this.calculateUserTagWeights(user_uuid);

    // 只添加权重较高的自动标签
    const highWeightTags = userTagWeights.filter((tag) => tag.type === 'auto' && tag.weight > 0.3);

    // 批量创建用户标签关联
    const tagAssociations = highWeightTags.map((tag) => ({
      user_uuid,
      tag_uuid: tag.tag_uuid,
    }));

    if (tagAssociations.length > 0) {
      await UserTag.bulkCreate(tagAssociations, {
        ignoreDuplicates: true,
      });
    }
  }

  /**
   * 获取用户兴趣分析报告
   */
  static async getUserInterestReport(user_uuid: string) {
    const tagWeights = await this.calculateUserTagWeights(user_uuid);

    return {
      user_uuid,
      total_tags: tagWeights.length,
      top_interests: tagWeights.slice(0, 5).map((tag) => ({
        tag_name: tag.tag_name,
        weight: tag.weight,
        type: tag.type,
      })),
      interest_categories: this.categorizeInterests(tagWeights),
      recommendation_confidence: this.calculateConfidence(tagWeights),
    };
  }

  /**
   * 分类用户兴趣
   */
  private static categorizeInterests(tagWeights: UserTagWeight[]) {
    const categories: Record<string, number> = {};

    // 这里可以根据标签名称进行简单的分类
    // 实际应用中可能需要更复杂的分类逻辑
    tagWeights.forEach((tag) => {
      const category = this.mapTagToCategory(tag.tag_name);
      categories[category] = (categories[category] || 0) + tag.weight;
    });

    return categories;
  }

  /**
   * 简单标签分类映射
   */
  private static mapTagToCategory(tagName: string): string {
    const outdoorKeywords = ['户外', '登山', '徒步', '露营', '骑行'];
    const sportsKeywords = ['运动', '健身', '篮球', '足球', '游泳'];
    const cultureKeywords = ['文化', '艺术', '音乐', '电影', '读书'];
    const socialKeywords = ['社交', '聚会', '交友', '桌游'];

    if (outdoorKeywords.some((keyword) => tagName.includes(keyword))) return '户外运动';
    if (sportsKeywords.some((keyword) => tagName.includes(keyword))) return '体育运动';
    if (cultureKeywords.some((keyword) => tagName.includes(keyword))) return '文化艺术';
    if (socialKeywords.some((keyword) => tagName.includes(keyword))) return '社交活动';

    return '其他';
  }

  /**
   * 计算推荐置信度
   */
  private static calculateConfidence(tagWeights: UserTagWeight[]): number {
    if (tagWeights.length === 0) return 0;

    const totalWeight = tagWeights.reduce((sum, tag) => sum + tag.weight, 0);
    const avgWeight = totalWeight / tagWeights.length;

    return Math.min(1, avgWeight * 2); // 归一化到0-1
  }
}
