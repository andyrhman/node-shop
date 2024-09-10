// import { userIdMidlleware } from "./middleware/userid.middleware";
import express, { Router } from "express";
import { AuthenticatedUser, FacebookAuth, googleAuth, Login, Logout, Register, ResendVerify, UpdateInfo, UpdatePassword, VerifyAccount } from "./controller/auth.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { Address, CreateAddress, DeleteAddress, GetAddress, UpdateAddress } from "./controller/address.controller";
import { Forgot, Reset } from "./controller/reset.controller";
import { CreateProduct, DeleteProduct, DeleteProductImage, DeleteProductVariation, GetProduct, GetProductAdmin, GetProductAvgRating, Products, UpdateProduct, UpdateProductImages, UpdateProductVariants, Variants } from "./controller/product.controller";
import { AdminAllCategories, Categories, CreateCategory, DeleteCategory, GetCategory, UpdateCategory } from "./controller/category.controller";
import { Upload } from "./controller/upload.controller";
import { TotalUsers, Users } from "./controller/user.controller";
import { Carts, CreateCart, DeleteCart, GetAuthUserCart, GetTotalCart, GetUserCart, UpdateCartQuantity } from "./controller/cart.controller";
import { ConfirmOrder, CreateOrder, Orders } from "./controller/order.controller";

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

  // * User
  router.get("/api/admin/users", AuthMiddleware, Users);
  router.get("/api/admin/total-users", AuthMiddleware, TotalUsers);

  // * Address
  router.get("/api/admin/address", AuthMiddleware, Address);
  router.post("/api/address", AuthMiddleware, CreateAddress);
  router.get("/api/address", AuthMiddleware, GetAddress);
  router.put("/api/address", AuthMiddleware, UpdateAddress);
  router.delete("/api/address", AuthMiddleware, DeleteAddress);

  // * Category
  router.get("/api/categories", Categories);
  router.get("/api/admin/categories", AuthMiddleware, AdminAllCategories);
  router.post("/api/admin/category", AuthMiddleware, CreateCategory);
  router.get("/api/admin/category/:id", AuthMiddleware, GetCategory);
  router.put("/api/admin/category/:id", AuthMiddleware, UpdateCategory);
  router.delete("/api/admin/category/:id", AuthMiddleware, DeleteCategory);

  // * Product
  router.get("/api/products", Products);
  router.get("/api/product/rating/:id", GetProductAvgRating);
  router.post("/api/admin/products", AuthMiddleware, CreateProduct);
  router.get("/api/variants", Variants);
  router.get("/api/product/:slug", GetProduct);
  router.get("/api/admin/product/:id", AuthMiddleware, GetProductAdmin);
  router.put("/api/admin/product/:id", AuthMiddleware, UpdateProduct);
  router.put(
    "/api/admin/product-variants/:id",
    AuthMiddleware,
    UpdateProductVariants
  );
  router.put(
    "/api/admin/product-images/:id",
    AuthMiddleware,
    UpdateProductImages
  );
  router.delete("/api/admin/product/:id", AuthMiddleware, DeleteProduct);
  router.delete(
    "/api/admin/product-images/:id",
    AuthMiddleware,
    DeleteProductImage
  );
  router.delete(
    "/api/admin/product-variants/:id",
    AuthMiddleware,
    DeleteProductVariation
  );

  // * Upload
  router.post("/api/admin/upload", AuthMiddleware, Upload);

  // * Cart
  router.get("/api/admin/carts", AuthMiddleware, Carts);
  router.get("/api/admin/carts/:id", AuthMiddleware, GetUserCart);
  router.post("/api/cart", AuthMiddleware, CreateCart);
  router.get("/api/cart", AuthMiddleware, GetAuthUserCart);
  router.put("/api/cart/:id", AuthMiddleware, UpdateCartQuantity);
  router.delete("/api/cart/:cart_id", AuthMiddleware, DeleteCart);
  router.get("/api/cart-total", AuthMiddleware, GetTotalCart);

  // * Order
  router.get("/api/admin/orders", AuthMiddleware, Orders);
  router.post("/api/checkout/orders", AuthMiddleware, CreateOrder);
  router.post("/api/checkout/orders/confirm", AuthMiddleware, ConfirmOrder);
  // router.get("/api/order-user", AuthMiddleware, GetUserOrder);
  // router.get("/api/admin/order-items/:id", AuthMiddleware, GetOrderItem);
  // router.put("/api/admin/orders/:id", AuthMiddleware, ChangeOrderStatus);

  // // * Review
  // router.get('/api/admin/reviews', AuthMiddleware, Reviews);
  // router.get('/api/admin/reviews/:id', AuthMiddleware, GetReviewAdmin);
  // router.get('/api/reviews/:id', GetReviewsUser);
  // router.post('/api/review', userIdMidlleware, CreateReview);

  // // * Statistic
  // router.get('/api/admin/stats', AuthMiddleware, Stats);
  // router.get('/api/admin/order-chart', AuthMiddleware, OrdersStat);
  // router.get('/api/admin/cart-chart', AuthMiddleware, CartsStat);
  // router.get('/api/admin/user-chart', AuthMiddleware, UsersStat);

  // * Reset Password
  router.post('/api/forgot', Forgot);
  router.post('/api/reset', Reset);
};
