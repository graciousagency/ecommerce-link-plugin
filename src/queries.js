export const getProducts = `
            query GetProducts($filters: ProductAttributeFilterInput $pageSize: Int $currentPage: Int) {
              products(
                filter: $filters
                pageSize: $pageSize
                currentPage: $currentPage
              ) {
                total_count
                aggregations {
                  attribute_code
                  label
                  options {
                    label
                    value
                    count
                  }
                }
                items {
                    uid
                    name
                    url_key
                    sku
                    small_image {
                      url
                    }
                    __typename
                }
              }
            }
            `;

export const getCategories = `
    query GetCategories($filters: CategoryFilterInput $pageSize: Int $currentPage: Int) {
        categories(
            filters: $filters
            pageSize: $pageSize
            currentPage: $currentPage
        ) {
            total_count
            items {
                uid
                name
                product_count
            }
        }
    }
`;

