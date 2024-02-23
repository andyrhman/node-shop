import myDataSource from "../config/db.config";
import { Token } from "../entity/token.entity";
import { AbstractService } from "./abstract.service";

export class TokenService extends AbstractService<Token> {
  constructor() {
    super(myDataSource.getRepository(Token));
  }

  async findByTokenExpiresAt(data: string) {
    const reset = await this.repository.findOne({ where: { token: data } });

    if (!reset || reset.expiresAt < Date.now()) {
      return null; // Token is invalid or expired
    }

    return reset;
  }
}
