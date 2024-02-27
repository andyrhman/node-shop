import { userIdMidlleware } from './middleware/userid.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { Router } from "express";
import { AuthenticatedUser, FacebookAuth, Login, Logout, Register, ResendVerify, UpdateInfo, UpdatePassword, VerifyAccount, googleAuth } from "./controller/auth.controller";
import { AdminAllCategories, Categories, CreateCategory, DeleteCategory, GetCategory, UpdateCategory } from './controller/category.controller';
import { CreateProduct, DeleteProduct, DeleteProductImage, DeleteProductVariation, GetProduct, GetProductAdmin, GetProductAvgRating, Products, UpdateProduct, UpdateProductImages, UpdateProductVariants, Variants } from './controller/product.controller';
import { Carts, CreateCart, DeleteCart, GetAuthUserCart, GetTotalCart, GetUserCart, UpdateCartQuantity } from './controller/cart.controller';

export const routes = (router: Router) => {
  // * Authentication
  router.post("/api/user/register", Register);
  router.post("/api/admin/login", Login);
  router.post("/api/user/login", Login);
  router.post("/api/user/google-auth", googleAuth);
  router.post("/api/user/facebook-auth", FacebookAuth);
  router.get("/api/admin", AuthMiddleware, AuthenticatedUser);
  router.get("/api/user", AuthMiddleware, AuthenticatedUser);
  router.post("/api/admin/logout", AuthMiddleware, Logout);
  router.post("/api/user/logout", AuthMiddleware, Logout);
  router.put("/api/admin/info", AuthMiddleware, UpdateInfo);
  router.put("/api/user/info", AuthMiddleware, UpdateInfo);
  router.put("/api/admin/password", AuthMiddleware, UpdatePassword);
  router.put("/api/user/password", AuthMiddleware, UpdatePassword);
  router.post("/api/verify", ResendVerify);
  router.put("/api/verify/:token", VerifyAccount);

  // * Category
  router.get('/api/categories', Categories);
  router.get('/api/admin/categories', AuthMiddleware, AdminAllCategories);
  router.post('/api/admin/category', AuthMiddleware, CreateCategory);
  router.get('/api/admin/category/:id', AuthMiddleware, GetCategory);
  router.put('/api/admin/category/:id', AuthMiddleware, UpdateCategory);
  router.delete('/api/admin/category/:id', AuthMiddleware, DeleteCategory);

  // * Product
  router.get('/api/products', Products);
  router.get('/api/product/rating/:id', GetProductAvgRating);
  router.post('/api/admin/products', AuthMiddleware, CreateProduct);
  router.get('/api/variants', Variants);
  router.get('/api/product/:slug', GetProduct);
  router.get('/api/admin/product/:id', AuthMiddleware, GetProductAdmin);
  router.put('/api/admin/product/:id', AuthMiddleware, UpdateProduct);
  router.put('/api/admin/product-variants/:id', AuthMiddleware, UpdateProductVariants);
  router.put('/api/admin/product-images/:id', AuthMiddleware, UpdateProductImages);
  router.delete('/api/admin/product/:id', AuthMiddleware, DeleteProduct);
  router.delete('/api/admin/product-images/:id', AuthMiddleware, DeleteProductImage);
  router.delete('/api/admin/product-variants/:id', AuthMiddleware, DeleteProductVariation);

  // * Cart
  router.get('/api/admin/carts', AuthMiddleware, Carts);
  router.get('/api/admin/carts/:id', AuthMiddleware, GetUserCart);
  router.post('/api/cart', userIdMidlleware, CreateCart);
  router.get('/api/cart', userIdMidlleware, GetAuthUserCart);
  router.put('/api/cart/:id', userIdMidlleware, UpdateCartQuantity);
  router.delete('/api/cart/:cart_id', userIdMidlleware, DeleteCart);
  router.get('/api/cart-total', userIdMidlleware, GetTotalCart);
};
