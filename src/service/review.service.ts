import mongoose from "mongoose";
import { Review, ReviewDocument } from "../models/review.schema";
import { AbstractService } from "./abstract.service";

export class ReviewService extends AbstractService<ReviewDocument> {
  constructor() {
    super(Review);
  }
    async findAndPopUser(options: any) {
        return this.model.find(options).sort({ createdAt: -1 }).populate('user_id');
    }
    async findAndPopUsPr(options: any) {
        return this.model.find(options).sort({ createdAt: -1 }).populate('user_id', 'product_id');
    }
    // ? https://www.phind.com/search?cache=ttxqttkk5uvdrefvxjufr0uk
    async calculateAverageRating(productId: string): Promise<number> {
        const reviews = await this.model.find({ product_id: new mongoose.Types.ObjectId(productId) });
        if (reviews.length === 0) return 0; // If no reviews, return 0

        const totalStars = reviews.reduce((total, review) => total + review.star, 0);
        return totalStars / reviews.length;
    }
    async getRatingAndReviewCount(productId: string): Promise<{ averageRating: number, reviewCount: number }> {
        const reviews = await this.model.find({ product_id: new mongoose.Types.ObjectId(productId) });
        let averageRating = 0;
        let reviewCount = reviews.length;

        if (reviewCount > 0) {
            const totalStars = reviews.reduce((total, review) => total + review.star, 0);
            averageRating = totalStars / reviewCount;
        }

        return { averageRating, reviewCount };
    }
}
