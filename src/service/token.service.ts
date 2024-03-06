import { Token, TokenDocument } from "../models/token.schema";
import { AbstractService } from "./abstract.service";

export class TokenService extends AbstractService<TokenDocument> {
  constructor() {
    super(Token);
  }

  async findByTokenExpiresAt(data: string) {
    const reset = await this.model.findOne({ token: data });

    if (!reset || reset.expiresAt < Date.now()) {
      return null; // Token is invalid or expired
    }

    return reset;
  }
}
