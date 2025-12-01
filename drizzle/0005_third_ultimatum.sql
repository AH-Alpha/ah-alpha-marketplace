CREATE TABLE `emailVerificationTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(6) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailVerificationTokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`storeDescription` text,
	`storeLogoUrl` text,
	`phoneNumber` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`governorate` varchar(100) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sellerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `sellerProfiles_userId_unique` UNIQUE(`userId`)
);
