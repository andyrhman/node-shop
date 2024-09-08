import { PrismaClient, Review, Prisma } from '@prisma/client';
import { AbstractService } from './abstract.service';

export class ReviewService extends AbstractService<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewCreateInput,
    Prisma.ReviewUpdateInput,
    Prisma.ReviewInclude
> {
    constructor(prisma: PrismaClient) {
        super(prisma, prisma.review);
    }
    async findMyReview(where: Prisma.ReviewWhereInput, include: Prisma.ReviewInclude = {}): Promise<Review[]> {
        return this.model.findMany({
            where,
            include,
            orderBy: { created_at: 'desc' },
        });
    }

    // ? https://www.phind.com/search?cache=ttxqttkk5uvdrefvxjufr0uk
    async calculateAverageRating(productId: string): Promise<number> {

        const reviews = await this.find({ product_id: productId });

        if (reviews.length === 0) return 0; // If no reviews, return 0

        const totalStars = reviews.reduce((total, review) => total + review.star, 0);
        return totalStars / reviews.length;
    }

    async getRatingAndReviewCount(productId: string): Promise<{ averageRating: number, reviewCount: number; }> {
        const reviews = await this.find({ product_id: productId });
        let averageRating = 0;
        let reviewCount = reviews.length;

        if (reviewCount > 0) {
            const totalStars = reviews.reduce((total, review) => total + review.star, 0);
            averageRating = totalStars / reviewCount;
        }

        return { averageRating, reviewCount };
    }
}
