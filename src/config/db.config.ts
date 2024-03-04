import logger from './logger.config';
import mongoose from 'mongoose';

const MongoConfig = () => {
    mongoose.connect(`mongodb+srv://tataran:${process.env.MONGO_PASSWORD}@nodeadmin.yjvkzpx.mongodb.net/node_shop?retryWrites=true&w=majority`)
        .then(() => logger.info('🗃️ Database has been initialized!'))
        .catch((err) => logger.error(err));
    // require('../models/user.schema');
    // require('../models/product.schema');
    // require('../models/order.schema');
    // require('../models/order-item.schema');
}

export default MongoConfig;