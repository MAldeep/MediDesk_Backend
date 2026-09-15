import { Model, PipelineStage } from "mongoose";

export interface SearchConfig {
  indexName?: string;
  searchFields?: string[];
  autocompleteFields?: string[];
}

export class APIFeatures<T> {
  public query: any;
  private queryString: Record<string, any>;
  public isSearchQuery: boolean = false;
  private model: Model<any>;
  private searchConfig: SearchConfig;

  constructor(
    model: Model<any>,
    queryString: Record<string, any>,
    searchConfig: SearchConfig = {},
  ) {
    this.model = model;
    this.queryString = queryString;
    this.searchConfig = {
      indexName: searchConfig.indexName || "default",
      searchFields: searchConfig.searchFields || ["status"],
      autocompleteFields: searchConfig.autocompleteFields || [],
    };
  }

  filter(): this {
    if (this.queryString.search) {
      this.isSearchQuery = true;
      const searchTerm = this.queryString.search as string;

      const shouldClauses: any[] = [];

      this.searchConfig.autocompleteFields?.forEach((field) => {
        shouldClauses.push({
          autocomplete: {
            query: searchTerm,
            path: field,
            fuzzy: { maxEdits: 1, prefixLength: 1 },
          },
        });
      });

      this.searchConfig.searchFields?.forEach((field) => {
        shouldClauses.push({
          text: {
            query: searchTerm,
            path: field,
            fuzzy: { maxEdits: 1 },
          },
        });
      });

      const searchStage: PipelineStage = {
        $search: {
          index: this.searchConfig.indexName,
          compound: {
            should: shouldClauses,
          },
        },
      };

      this.query = this.model.aggregate([searchStage]);
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
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");

      if (this.isSearchQuery) {
        const sortObj: Record<string, 1 | -1> = {};
        sortBy.split(" ").forEach((field) => {
          if (field.startsWith("-")) {
            sortObj[field.substring(1)] = -1;
          } else {
            sortObj[field] = 1;
          }
        });
        this.query = this.query.append([{ $sort: sortObj }]);
      } else {
        this.query = this.query.sort(sortBy);
      }
    } else {
      if (this.isSearchQuery) {
        this.query = this.query.append([{ $sort: { createdAt: -1 } }]);
      } else {
        this.query = this.query.sort("-createdAt");
      }
    }
    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");

      if (this.isSearchQuery) {
        const projectObj: Record<string, 1 | 0> = {};
        fields.split(" ").forEach((field) => {
          if (field.startsWith("-")) {
            projectObj[field.substring(1)] = 0;
          } else {
            projectObj[field] = 1;
          }
        });
        this.query = this.query.append([{ $project: projectObj }]);
      } else {
        this.query = this.query.select(fields);
      }
    } else if (!this.isSearchQuery) {
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
