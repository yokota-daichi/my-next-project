import { createClient } from 'microcms-js-sdk';
import type {
  MicroCMSQueries,
  MicroCMSImage,
  MicroCMSListContent,
} from 'microcms-js-sdk';

export type Member = {
  name: string;
  position: string;
  profile: string;
  image: MicroCMSImage;
} & MicroCMSListContent;

export type Category = {
  name: string;
} & MicroCMSListContent;

export type News = {
  title: string;
  description: string;
  content: string;
  thumbnail?: MicroCMSImage;
  category: Category;
} & MicroCMSListContent;

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}

if (!process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}

const rawServiceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
let serviceDomain = rawServiceDomain as string;
try {
  if (serviceDomain.startsWith('http')) {
    const u = new URL(serviceDomain);
    serviceDomain = u.hostname.split('.')[0];
  } else if (serviceDomain.includes('/')) {
    // handle values like "uhr24fy7pd.microcms.io/apis/member"
    const maybeHost = serviceDomain.split('/')[0];
    if (maybeHost.includes('.')) {
      serviceDomain = maybeHost.split('.')[0];
    }
  } else if (serviceDomain.includes('.')) {
    // handle values like "uhr24fy7pd.microcms.io"
    serviceDomain = serviceDomain.split('.')[0];
  }
} catch (e) {
  // fall back to raw value if parsing fails
  serviceDomain = rawServiceDomain as string;
}

const client = createClient({
  serviceDomain,
  apiKey: process.env.MICROCMS_API_KEY,
});

export const getMembersList = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<Member>({
    endpoint: 'members',
    queries,
  });
  return listData;
};

export const getNewsList = async (queries?: MicroCMSQueries) => {
  const listData = await client.getList<News>({
    endpoint: 'news',
    queries,
  });
  return listData;
};

export const getNewsDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.getListDetail<News>({
    endpoint: 'news',
    contentId,
    queries,
    customRequestInit: {
      next: {
        revalidate: queries?.draftKey === undefined ? 60 : 0,
      },
    },
  });

  return detailData;
};

export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  const detailData = await client.getListDetail<Category>({
    endpoint: 'categories',
    contentId,
    queries,
  });

  return detailData;
};

export const getAllNewsList = async () => {
  try {
    const listData = await client.getAllContents<News>({
      endpoint: 'news',
    });

    return listData;
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.warn('[microcms] failed to getAllNewsList:', msg);
    if (msg.includes('404')) {
      return [] as News[];
    }
    throw e;
  }
};

export const getAllCategoryList = async () => {
  try {
    const listData = await client.getAllContents<Category>({
      endpoint: 'categories',
    });

    return listData;
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.warn('[microcms] failed to getAllCategoryList:', msg);
    if (msg.includes('404')) {
      return [] as Category[];
    }
    throw e;
  }
};
