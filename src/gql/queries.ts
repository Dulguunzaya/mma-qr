export const PAGES_QUERY = `
  query Pages($language: String, $limit: Int) {
    cpPageList(language: $language, limit: $limit) {
      pages {
        _id
        name
        slug
        description
        content
        customFieldsData
        customFieldsMap
      }
    }
  }
`;

export const PAGE_DETAIL_QUERY = `
  query PageDetail($slug: String, $language: String) {
    cpCmsPageDetail(slug: $slug, language: $language) {
      _id
      name
      slug
      description
      content
      thumbnail {
        url
      }
      customFieldsData
      customFieldsMap
    }
  }
`;

export const CATEGORIES_QUERY = `
  query Categories($language: String, $limit: Int) {
    cpCategories(language: $language, limit: $limit) {
      list {
        _id
        slug
      }
    }
  }
`;

export const POSTS_QUERY = `
  query Posts(
    $language: String
    $categoryIds: [String]
    $status: PostStatus
    $sortField: String
    $sortDirection: String
    $limit: Int
  ) {
    cpPosts(
      language: $language
      categoryIds: $categoryIds
      status: $status
      sortField: $sortField
      sortDirection: $sortDirection
      limit: $limit
    ) {
      _id
      title
      slug
      content
      excerpt
      publishedDate
      createdAt
      tagIds
      thumbnail {
        url
      }
      images {
        url
      }
      customFieldsData
      customFieldsMap
    }
  }
`;

export const POST_QUERY = `
  query Post($slug: String, $language: String) {
    cpPost(slug: $slug, language: $language) {
      _id
      title
      slug
      content
      excerpt
      publishedDate
      createdAt
      thumbnail {
        url
      }
      images {
        url
      }
      customFieldsData
      customFieldsMap
    }
  }
`;

export const MENUS_QUERY = `
  query Menus($language: String, $kind: String) {
    cpMenus(language: $language, kind: $kind) {
      _id
      parentId
      label
      url
      order
      target
    }
  }
`;

export const PRODUCT_DETAIL_QUERY = `
  query ProductDetail($id: String) {
    cpProductDetail(_id: $id) {
      _id
      name
      code
      unitPrice
      currency
    }
  }
`;
