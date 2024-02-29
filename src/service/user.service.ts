import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import { AbstractService } from "./abstract.service";

export class UserService extends AbstractService<User> {
  constructor() {
    super(myDataSource.getRepository(User));
  }
  async find(options: any, relations = []) {
    return this.repository.find({
      where: options,
      relations,
      order: { created_at: "DESC" },
    });
  }
  async chart(): Promise<any[]> {
    const query = `
        SELECT
        TO_CHAR(u.created_at, 'YYYY-MM-DD') as date,
        COUNT(u.id) as count
        FROM users u
        GROUP BY TO_CHAR(u.created_at, 'YYYY-MM-DD')
        ORDER BY TO_CHAR(u.created_at, 'YYYY-MM-DD') ASC;      
    `;

    const result = await this.repository.query(query);
    return result;
  }
}
