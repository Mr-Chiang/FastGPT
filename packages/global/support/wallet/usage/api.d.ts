import { UsageSourceEnum } from './constants';
import { UsageListItemCountType, UsageListItemType } from './type';

export type CreateTrainingUsageProps = {
  name: string;
  datasetId: string;
};

export type ConcatUsageProps = UsageListItemCountType & {
  teamId: string;
  tmbId: string;
  billId?: string;
  totalPoints: number;
  listIndex?: number;
};

export type CreateUsageProps = {
  teamId: string;
  tmbId: string;
  appName: string;
  appId?: string;
  totalPoints: number;
  // inputTokens: number;
  source: `${UsageSourceEnum}`;
  list: UsageListItemType[];
};
