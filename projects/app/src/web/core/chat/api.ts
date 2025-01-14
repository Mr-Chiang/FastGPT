import { GET, POST, DELETE, PUT } from '@/web/common/api/request';
import type { ChatHistoryItemType, chatAppListSchema } from '@fastgpt/global/core/chat/type.d';

import type {
  CloseCustomFeedbackParams,
  InitChatProps,
  InitChatResponse,
  InitOutLinkChatProps,
  getHistoriesProps
} from '@/global/core/chat/api.d';
import type {
  AdminUpdateFeedbackParams,
  ClearHistoriesProps,
  DelHistoryProps,
  DeleteChatItemProps,
  UpdateHistoryProps
} from '@/global/core/chat/api.d';
import { UpdateChatFeedbackProps } from '@fastgpt/global/core/chat/api';

/**
 * 根据队伍ID和获取
 */
export const getChatListById = (data: { shareTeamId: string; authToken: string }) =>
  POST<chatAppListSchema>(`/proApi/core/chat/init`, data);

/**
 * 获取团队分享的对话列表 initTeamChat
 * @param data
 * @returns
 */
export const getinitTeamChat = (data: { teamId: string; authToken: string; appId: string }) =>
  GET(`/proApi/core/chat/initTeamChat`, data);

/**
 * 获取初始化聊天内容
 */
export const getInitChatInfo = (data: InitChatProps) =>
  GET<InitChatResponse>(`/core/chat/init`, data);
export const getInitChatInfoTeam = (data: InitChatProps) =>
  GET<InitChatResponse>(`/core/chat/init`, data);
export const getInitOutLinkChatInfo = (data: InitOutLinkChatProps) =>
  GET<InitChatResponse>(`/core/chat/outLink/init`, data);
export const getTeamChatInfo = (data: { appId: string; chatId: string; outLinkUid?: string }) =>
  GET<InitChatResponse>(`/core/chat/team/init`, data);

/**
 * get current window history(appid or shareId)
 */
export const getChatHistories = (data: getHistoriesProps) =>
  POST<ChatHistoryItemType[]>('/core/chat/getHistories', data);

/**
 * delete one history
 */
export const delChatHistoryById = (data: DelHistoryProps) => DELETE(`/core/chat/delHistory`, data);
/**
 * clear all history by appid
 */
export const clearChatHistoryByAppId = (data: ClearHistoriesProps) =>
  DELETE(`/core/chat/clearHistories`, data);

/**
 * delete one chat record
 */
export const delChatRecordById = (data: DeleteChatItemProps) =>
  DELETE(`/core/chat/item/delete`, data);

/**
 * 修改历史记录: 标题/置顶
 */
export const putChatHistory = (data: UpdateHistoryProps) => PUT('/core/chat/updateHistory', data);

/* -------------- feedback ------------ */
export const updateChatUserFeedback = (data: UpdateChatFeedbackProps) =>
  POST('/core/chat/feedback/updateUserFeedback', data);

export const updateChatAdminFeedback = (data: AdminUpdateFeedbackParams) =>
  POST('/core/chat/feedback/adminUpdate', data);

export const closeCustomFeedback = (data: CloseCustomFeedbackParams) =>
  POST('/core/chat/feedback/closeCustom', data).catch();
