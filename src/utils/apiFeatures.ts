import { Model } from "mongoose";

export class APIFeatures<T> {
  public query: any;
  private queryString: Record<string, any>;
  private isSearchQuery: boolean = false;
  private model: Model<any>;

  constructor(model: Model<any>, queryString: Record<string, any>) {
    this.model = model;
    this.queryString = queryString;
  }

  filter(): this {
    if (this.queryString.search) {
      this.isSearchQuery = true;
      const searchTerm = this.queryString.search as string;

      this.query = this.model.aggregate([
        {
          $search: {
            index: "patient_search_index",
            compound: {
              should: [
                {
                  autocomplete: {
                    query: searchTerm,
                    path: "name",
                    fuzzy: { maxEdits: 1, prefixLength: 1 },
                  },
                },
                {
                  autocomplete: {
                    query: searchTerm,
                    path: "phone",
                  },
                },
              ],
            },
          },
        },
      ]);
      return this;
    }

    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.model.find(JSON.parse(queryStr));
    return this;
  }

  sort(): this {
    if (this.isSearchQuery) return this;

    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields(): this {
    if (this.isSearchQuery) return this;

    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate(): this {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, parseInt(this.queryString.limit, 10) || 10);
    const skip = (page - 1) * limit;

    if (this.isSearchQuery) {
      this.query = this.query.append([{ $skip: skip }, { $limit: limit }]);
    } else {
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
