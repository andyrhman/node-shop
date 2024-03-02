import myDataSource from "../config/db.config";
import { Reset } from "../entity/reset.entity";
import { AbstractService } from "./abstract.service";

export class ResetService extends AbstractService<Reset> {
  constructor() {
    super(myDataSource.getRepository(Reset));
  }
  async findByTokenExpiresAt(token: string): Promise<Reset | null> {
    const reset = await this.repository.findOne({ where: { token } });

    if (!reset || reset.expiresAt < Date.now()) {
      return null; // Token is invalid or expired
    }

    return reset;
  }
}
