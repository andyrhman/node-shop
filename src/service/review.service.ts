import myDataSource from "../config/db.config";
import { Review } from "../entity/review.entity";
import { AbstractService } from "./abstract.service";

export class ReviewService extends AbstractService<Review> {
  constructor() {
    super(myDataSource.getRepository(Review));
  }
    async find(options, relations = []) {
        return this.repository.find({ where: options, relations, order: {created_at: 'DESC'}  });
    }
    // ? https://www.phind.com/search?cache=ttxqttkk5uvdrefvxjufr0uk
    async calculateAverageRating(productId: string): Promise<number> {
        const reviews = await this.repository.find({ where: { product_id: productId } });
        if (reviews.length === 0) return 0; // If no reviews, return 0

        const totalStars = reviews.reduce((total, review) => total + review.star, 0);
        return totalStars / reviews.length;
    }
    async getRatingAndReviewCount(productId: string): Promise<{ averageRating: number, reviewCount: number }> {
        const reviews = await this.repository.find({ where: { product_id: productId } });
        let averageRating = 0;
        let reviewCount = reviews.length;

        if (reviewCount > 0) {
            const totalStars = reviews.reduce((total, review) => total + review.star, 0);
            averageRating = totalStars / reviewCount;
        }

        return { averageRating, reviewCount };
    }
}
