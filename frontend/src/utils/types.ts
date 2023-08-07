import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

export type NextPageLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type APIError = {
  error: Response;
  response: { data: { msg: string } };
};

export type APIResponse<T> = {
  success: boolean;
  data: T | null;
  error: APIError | null;
};

export type APIResponseWithMsg<T> = {
  success: boolean;
  data: T | null;
  error: APIError | null;
  msg: string;
};

export type APIPaginationResponse<T> = {
  success: boolean;
  data: T | null;
  error: APIError | null;
  total: number;
  hasMore: boolean;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageLayout;
};
export interface PermissionInt {
  _id: string;
  name: string;
  description: string;
  roles: RoleInt[];
}

export interface RoleInt {
  _id: string;
  name: string;
  description: string;
  permissions: PermissionInt[];
  assignables: RoleInt[];
  color: string;
}

export interface UserInt {
  _id: string;
  discordId: string;
  accessToken?: string;
  username: string;
  roles: RoleInt[];
  avatar?: string;
}
