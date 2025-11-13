CREATE TABLE `cart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`parentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`priceAtPurchase` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`totalPrice` int NOT NULL,
	`commission` int NOT NULL,
	`status` enum('pending','confirmed','shipped','delivered','cancelled','disputed') NOT NULL DEFAULT 'pending',
	`trackingCode` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`condition` enum('new','used') NOT NULL DEFAULT 'new',
	`quantity` int NOT NULL DEFAULT 1,
	`imageUrls` text,
	`status` enum('active','sold','removed') NOT NULL DEFAULT 'active',
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`productId` int NOT NULL,
	`productRating` int NOT NULL,
	`packagingRating` int NOT NULL,
	`shippingRating` int NOT NULL,
	`serviceRating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deposit','withdrawal','commission','refund','bonus') NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`relatedOrderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','seller') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('buyer','seller','both') DEFAULT 'buyer' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `balance` int DEFAULT 5000 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalSales` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `averageRating` decimal(3,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `users` ADD `sellerName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `sellerDescription` text;