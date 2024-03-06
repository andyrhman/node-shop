import logger from './logger.config';
import mongoose from 'mongoose';

const MongoConfig = () => {
    mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`)
        .then(() => logger.info('🗃️ Database has been initialized!'))
        .catch((err) => logger.error(err));
    require('../models/user.schema');
    require('../models/address.schema');
    require('../models/product.schema');
    require('../models/product-images.schema');
    require('../models/product-variation.schema');
    require('../models/cart.schema');
    require('../models/order.schema');
    require('../models/order-items.schema');
    require('../models/category.schema');
    require('../models/reset.schema');
    require('../models/review.schema');
    require('../models/token.schema');
}

export default MongoConfig;