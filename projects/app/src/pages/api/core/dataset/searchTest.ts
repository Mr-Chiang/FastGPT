import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { withNextCors } from '@fastgpt/service/common/middle/cors';
import type { SearchTestProps, SearchTestResponse } from '@/global/core/dataset/api.d';
import { connectToDatabase } from '@/service/mongo';
import { authDataset } from '@fastgpt/service/support/permission/auth/dataset';
import { pushGenerateVectorUsage } from '@/service/support/wallet/usage/push';
import { searchDatasetData } from '@/service/core/dataset/data/controller';
import { updateApiKeyUsage } from '@fastgpt/service/support/openapi/tools';
import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import { getLLMModel } from '@fastgpt/service/core/ai/model';
import { datasetSearchQueryExtension } from '@fastgpt/service/core/dataset/search/utils';
import {
  checkTeamAIPoints,
  checkTeamReRankPermission
} from '@fastgpt/service/support/permission/teamLimit';

export default withNextCors(async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const {
      datasetId,
      text,
      limit = 1500,
      similarity,
      searchMode,
      usingReRank,

      datasetSearchUsingExtensionQuery = false,
      datasetSearchExtensionModel,
      datasetSearchExtensionBg = ''
    } = req.body as SearchTestProps;

    if (!datasetId || !text) {
      throw new Error('缺少参数');
    }
    const start = Date.now();

    // auth dataset role
    const { dataset, teamId, tmbId, apikey } = await authDataset({
      req,
      authToken: true,
      authApiKey: true,
      datasetId,
      per: 'r'
    });
    // auth balance
    await checkTeamAIPoints(teamId);

    // query extension
    const extensionModel =
      datasetSearchUsingExtensionQuery && datasetSearchExtensionModel
        ? getLLMModel(datasetSearchExtensionModel)
        : undefined;
    const { concatQueries, rewriteQuery, aiExtensionResult } = await datasetSearchQueryExtension({
      query: text,
      extensionModel,
      extensionBg: datasetSearchExtensionBg
    });

    const { searchRes, charsLength, ...result } = await searchDatasetData({
      teamId,
      reRankQuery: rewriteQuery,
      queries: concatQueries,
      model: dataset.vectorModel,
      limit: Math.min(limit, 20000),
      similarity,
      datasetIds: [datasetId],
      searchMode,
      usingReRank: usingReRank && (await checkTeamReRankPermission(teamId))
    });

    // push bill
    const { totalPoints } = pushGenerateVectorUsage({
      teamId,
      tmbId,
      charsLength,
      model: dataset.vectorModel,
      source: apikey ? UsageSourceEnum.api : UsageSourceEnum.fastgpt,

      ...(aiExtensionResult &&
        extensionModel && {
          extensionModel: extensionModel.name,
          extensionCharsLength: aiExtensionResult.charsLength
        })
    });
    if (apikey) {
      updateApiKeyUsage({
        apikey,
        totalPoints: totalPoints
      });
    }

    jsonRes<SearchTestResponse>(res, {
      data: {
        list: searchRes,
        duration: `${((Date.now() - start) / 1000).toFixed(3)}s`,
        usingQueryExtension: !!aiExtensionResult,
        ...result
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
});
