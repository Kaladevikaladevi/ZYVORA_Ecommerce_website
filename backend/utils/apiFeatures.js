/**
 * Chainable query-builder helper for list endpoints:
 * search, filter (category / price range), sort, and paginate.
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filters = {};
  }

  search() {
    const keyword = this.queryString.keyword?.trim();
    if (keyword) {
      this.filters.name = { $regex: keyword, $options: 'i' };
    }
    return this;
  }

  filter() {
    const { category, brand, minPrice, maxPrice, rating } = this.queryString;

    if (category) this.filters.category = category;
    if (brand) this.filters.brand = { $regex: brand, $options: 'i' };

    if (minPrice || maxPrice) {
      this.filters.price = {};
      if (minPrice) this.filters.price.$gte = Number(minPrice);
      if (maxPrice) this.filters.price.$lte = Number(maxPrice);
    }

    if (rating) this.filters.ratings = { $gte: Number(rating) };

    this.query = this.query.find(this.filters);
    return this;
  }

  sort() {
    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating-desc': { ratings: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'best-selling': { sold: -1 },
    };
    this.query = this.query.sort(sortMap[this.queryString.sort] || { createdAt: -1 });
    return this;
  }

  paginate(defaultLimit = 12) {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.max(1, Number(this.queryString.limit) || defaultLimit);
    this.pagination = { page, limit, skip: (page - 1) * limit };
    this.query = this.query.skip(this.pagination.skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;
