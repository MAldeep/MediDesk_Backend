import { Query } from "mongoose";

// <T> is a generic typing to work with any model IPatient , IAppointment , etc..
export class APIFeatures<T> {
  // this is any mongoose query like find()
  public query: Query<T[], T>;
  // this is query coming in the req.query
  private queryString: Record<string, any>;
  // This is the constructor of the class (any instance will have those )
  constructor(query: Query<T[], T>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }
  filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((field) => delete queryObj[field]);
    if (this.queryString.search) {
      this.query = this.query.find({
        $text: { $search: this.queryString.search as string },
      });
    }
    let queryStr = JSON.stringify(queryObj);
    // then we replace plain text to query mongoose can understand by regex
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort(): this {
    // if frontend sends a sort
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // if didn't send a sort, default is the most recent
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields(): this {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // if frontend didn't select fields, we exclude __v by default (not imp for frontend)
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate(): this {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, parseInt(this.queryString.limit) || 10);
    const skip = (page - 1) * limit;
    // so if limit is 5 , and frontend requested third page , skip = (3-1) * 5 = 10
    // so it will skip 10 elemets which are the first and second page
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
