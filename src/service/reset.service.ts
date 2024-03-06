import { Reset, ResetDocument } from "../models/reset.schema";
import { AbstractService } from "./abstract.service";

export class ResetService extends AbstractService<ResetDocument> {
  constructor() {
    super(Reset);
  }
  async findByTokenExpiresAt(token: string): Promise<ResetDocument | null> {
    const reset = await this.model.findOne({ token });

    if (!reset || reset.expiresAt < Date.now()) {
      return null; // Token is invalid or expired
    }

    return reset;
  }
}
