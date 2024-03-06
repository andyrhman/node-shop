import mongoose, { Model } from "mongoose";

export abstract class AbstractService<T extends mongoose.Document<any>> {
  protected model: Model<T>;

  protected constructor(model: Model<T>) {
    this.model = model;
  }

  async all(): Promise<T[]> {
    return this.model.find().exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const created = new this.model(data);
    return created.save();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async findOne(options: object): Promise<T | null> {
    return this.model.findOne(options).exec();
  }

  async findByEmail(email: string): Promise<T | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<T | null> {
    return this.model.findOne({ username }).exec();
  }

  async findByUsernameOrEmail(username: string, email: string): Promise<T | null> {
    return this.model.findOne({
      $or: [{ username }, { email }],
    }).exec();
  }
}