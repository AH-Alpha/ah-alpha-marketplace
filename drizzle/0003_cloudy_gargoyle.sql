CREATE TABLE `auctions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`sellerId` int NOT NULL,
	`startPrice` int NOT NULL,
	`currentHighestBid` int NOT NULL,
	`highestBidderId` int,
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp NOT NULL,
	`status` enum('active','ended','cancelled') NOT NULL DEFAULT 'active',
	`totalBids` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auctions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auctionId` int NOT NULL,
	`bidderId` int NOT NULL,
	`bidAmount` int NOT NULL,
	`status` enum('active','outbid','won') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);
