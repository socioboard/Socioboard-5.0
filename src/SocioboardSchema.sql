-- --------------------------------------------------------
-- Host:                         158.177.104.8
-- Server version:               10.1.31-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             9.5.0.5288
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for socioboard3
CREATE DATABASE IF NOT EXISTS `socioboard3` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `socioboard3`;

-- Dumping structure for table socioboard3.adsoffers
CREATE TABLE IF NOT EXISTS `adsoffers` (
  `Id` int(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) DEFAULT NULL,
  `adcreateddate` datetime DEFAULT NULL,
  `EmailId` varchar(500) DEFAULT NULL,
  `Verified` bit(1) DEFAULT NULL,
  `WebsiteUrl` varchar(5000) DEFAULT NULL,
  `adsaccountstatus` bit(1) DEFAULT b'0',
  `Verifieddate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.affiliates
CREATE TABLE IF NOT EXISTS `affiliates` (
  `Id` bigint(20) NOT NULL,
  `UserId` bigint(20) NOT NULL,
  `FriendUserId` bigint(20) NOT NULL,
  `AffiliateDate` datetime NOT NULL,
  `Amount` double DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `CouponCode` varchar(350) NOT NULL,
  `EntryCouponDate` datetime DEFAULT NULL,
  `ExpCouponDate` datetime DEFAULT NULL,
  `Discount` int(11) DEFAULT '0' COMMENT 'range is 0 - 99',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.daywiseschedule
CREATE TABLE IF NOT EXISTS `daywiseschedule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shareMessage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `weekdays` varchar(500) NOT NULL,
  `clientTime` datetime DEFAULT NULL,
  `scheduleTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `postedTime` datetime DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `profileType` tinyint(4) NOT NULL,
  `profileId` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `picUrl` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `socialprofileName` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `url` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `localscheduletime` datetime DEFAULT NULL,
  `link` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `calendertime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.demorequest
CREATE TABLE IF NOT EXISTS `demorequest` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  `lastName` varchar(500) CHARACTER SET utf8 DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `emailId` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `company` varchar(50) DEFAULT NULL,
  `phoneNumber` varchar(50) DEFAULT NULL,
  `location` varchar(50) DEFAULT NULL,
  `skype` varchar(50) DEFAULT NULL,
  `message` varchar(50) DEFAULT NULL,
  `companyWebsite` varchar(50) DEFAULT NULL,
  `demoPlanType` varchar(50) DEFAULT NULL,
  `emailValidationTokenId` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.discovery
CREATE TABLE IF NOT EXISTS `discovery` (
  `Network` varchar(350) DEFAULT NULL,
  `SearchKeyword` varchar(3502) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createTime` datetime DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `GroupId` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.draft
CREATE TABLE IF NOT EXISTS `draft` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shareMessage` varchar(10000) CHARACTER SET utf8mb4 DEFAULT '0',
  `scheduleTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `picUrl` varchar(5000) DEFAULT NULL,
  `GroupId` bigint(20) NOT NULL DEFAULT '0',
  `mediaType` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.ewallet
CREATE TABLE IF NOT EXISTS `ewallet` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) DEFAULT NULL,
  `EmailId` text,
  `Frommailid` text,
  `Fromid` bigint(20) DEFAULT NULL,
  `Amount` bigint(20) DEFAULT NULL,
  `Transactiondate` datetime DEFAULT NULL,
  `TransactionId` varchar(50) DEFAULT NULL,
  `TransactionType` text,
  `TransactionStatus` text,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.ewalletwithdrawrequest
CREATE TABLE IF NOT EXISTS `ewalletwithdrawrequest` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserName` varchar(50) NOT NULL,
  `UserEmail` varchar(50) NOT NULL,
  `WithdrawAmount` varchar(50) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL,
  `PaypalEmail` varchar(50) NOT NULL,
  `IbanCode` varchar(50) NOT NULL,
  `SwiftCode` varchar(50) NOT NULL,
  `Other` varchar(50) NOT NULL,
  `Status` bit(1) NOT NULL COMMENT 'Received=0, processing=1, paid=2',
  `RequestDate` datetime NOT NULL,
  `UserID` bigint(20) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.facebookaccounts
CREATE TABLE IF NOT EXISTS `facebookaccounts` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `FbUserId` varchar(100) NOT NULL,
  `FbUserName` varchar(100) NOT NULL,
  `AccessToken` varchar(1000) NOT NULL,
  `Friends` bigint(20) NOT NULL,
  `PageShareathonUpdate` datetime DEFAULT NULL,
  `GroupShareathonUpdate` datetime DEFAULT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
  `EmailId` varchar(50) DEFAULT NULL,
  `FbProfileType` tinyint(4) NOT NULL,
  `FbPageSubscription` tinyint(4) NOT NULL,
  `ProfileUrl` varchar(1000) DEFAULT NULL,
  `IsActive` tinyint(4) NOT NULL,
  `UserId` bigint(20) NOT NULL,
  `LastUpdate` datetime DEFAULT NULL,
  `IsAccessTokenActive` bit(1) NOT NULL,
  `coverPic` varchar(500) DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  `education` varchar(50) DEFAULT NULL,
  `college` varchar(500) DEFAULT NULL,
  `workPosition` varchar(500) DEFAULT NULL,
  `homeTown` varchar(500) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `about` varchar(5000) DEFAULT NULL,
  `workCompany` varchar(5000) DEFAULT NULL,
  `Is90DayDataUpdated` bit(1) DEFAULT NULL,
  `lastpagereportgenerated` datetime DEFAULT NULL,
  `contenetShareathonUpdate` datetime DEFAULT NULL,
  `SocailSignInEnable` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.feedback
CREATE TABLE IF NOT EXISTS `feedback` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) DEFAULT NULL,
  `createddate` datetime DEFAULT NULL,
  `EmailId` varchar(250) DEFAULT NULL,
  `UserActivationStatus` tinyint(4) DEFAULT NULL,
  `AccountType` tinyint(4) DEFAULT NULL,
  `RegisterAccountType` varchar(500) DEFAULT NULL,
  `FeedBackMsg` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.googleanalyticsaccount
CREATE TABLE IF NOT EXISTS `googleanalyticsaccount` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `EmailId` varchar(350) DEFAULT NULL,
  `GaAccountId` varchar(50) DEFAULT NULL,
  `GaAccountName` varchar(250) DEFAULT NULL,
  `LastUpdate` datetime DEFAULT NULL,
  `GaWebPropertyId` varchar(250) DEFAULT NULL,
  `GaProfileId` varchar(50) DEFAULT NULL,
  `GaProfileName` varchar(350) DEFAULT NULL,
  `WebsiteUrl` varchar(350) DEFAULT NULL,
  `RefreshToken` varchar(350) DEFAULT NULL,
  `AccessToken` varchar(550) DEFAULT NULL,
  `ProfilePicUrl` varchar(250) DEFAULT NULL,
  `Visits` double DEFAULT NULL,
  `Views` double DEFAULT NULL,
  `TwitterPosts` double DEFAULT NULL,
  `WebMentions` double DEFAULT NULL,
  `IsActive` tinyint(1) unsigned DEFAULT NULL,
  `EntryDate` datetime DEFAULT NULL,
  `Is90DayDataUpdated` bit(1) DEFAULT NULL,
  `internalWebPropertyId` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.googleplusaccounts
CREATE TABLE IF NOT EXISTS `googleplusaccounts` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL DEFAULT '0',
  `GpUserId` varchar(50) NOT NULL DEFAULT '0',
  `GpUserName` varchar(50) NOT NULL DEFAULT '0',
  `GpProfileImage` varchar(500) DEFAULT '0',
  `AccessToken` varchar(5000) NOT NULL DEFAULT '0',
  `coverPic` varchar(500) DEFAULT NULL,
  `birthday` varchar(50) DEFAULT NULL,
  `education` varchar(50) DEFAULT NULL,
  `college` varchar(500) DEFAULT NULL,
  `workPosition` varchar(500) DEFAULT NULL,
  `homeTown` varchar(500) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `about` varchar(5000) DEFAULT NULL,
  `workCompany` varchar(5000) DEFAULT NULL,
  `RefreshToken` varchar(5000) DEFAULT '0',
  `EmailId` varchar(500) NOT NULL DEFAULT '0',
  `IsActive` bit(1) NOT NULL DEFAULT b'0',
  `InYourCircles` bigint(20) NOT NULL DEFAULT '0',
  `HaveYouInCircles` bigint(20) NOT NULL DEFAULT '0',
  `EntryDate` datetime DEFAULT NULL,
  `LastUpdate` datetime DEFAULT NULL,
  `IsAccessTokenActive` bit(1) NOT NULL DEFAULT b'1',
  `socialSignInEnable` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.groupmembers
CREATE TABLE IF NOT EXISTS `groupmembers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL DEFAULT '0',
  `memberStatus` tinyint(4) NOT NULL DEFAULT '0',
  `groupid` bigint(20) DEFAULT '0',
  `isAdmin` tinyint(4) NOT NULL DEFAULT '0',
  `memberCode` varchar(100) NOT NULL DEFAULT '0',
  `profileImg` varchar(5000) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `email` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Index 2` (`userId`,`groupid`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.groupprofiles
CREATE TABLE IF NOT EXISTS `groupprofiles` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ProfileOwnerId` bigint(20) NOT NULL DEFAULT '0',
  `ProfileType` tinyint(4) NOT NULL DEFAULT '0',
  `ProfileName` varchar(50) NOT NULL DEFAULT '0',
  `ProfileId` varchar(500) NOT NULL DEFAULT '0',
  `ProfilePic` varchar(500) DEFAULT '0',
  `GroupId` bigint(20) NOT NULL DEFAULT '0',
  `EntryDate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `GroupId` (`GroupId`,`ProfileId`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `GroupName` varchar(50) NOT NULL DEFAULT 'Socioboard',
  `CreatedDate` datetime NOT NULL,
  `AdminId` bigint(20) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `GroupName_AdminId` (`GroupName`,`AdminId`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.imglibrary
CREATE TABLE IF NOT EXISTS `imglibrary` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `ImageName` text NOT NULL,
  `ImagePath` text NOT NULL,
  `ImageSize` bigint(20) NOT NULL,
  `Imageuploadeddate` datetime NOT NULL,
  `Tags` text,
  `FolderType` tinytext,
  `LocalImagePath` text,
  `Fileextension` text,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.instagramaccounts
CREATE TABLE IF NOT EXISTS `instagramaccounts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `InstagramId` varchar(350) DEFAULT NULL,
  `AccessToken` varchar(350) DEFAULT NULL,
  `InsUserName` varchar(350) DEFAULT NULL,
  `ProfileUrl` varchar(350) DEFAULT NULL,
  `Followers` int(11) DEFAULT NULL,
  `FollowedBy` int(11) DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `IsActive` bit(1) DEFAULT NULL,
  `TotalImages` int(11) DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `Is90DayDataUpdated` bit(1) DEFAULT NULL,
  `lastpagereportgenerated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InstagramId` (`InstagramId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.linkedinaccount
CREATE TABLE IF NOT EXISTS `linkedinaccount` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `LinkedinUserId` varchar(350) DEFAULT NULL,
  `LinkedinUserName` varchar(350) DEFAULT NULL,
  `OAuthToken` varchar(350) DEFAULT NULL,
  `OAuthSecret` varchar(350) DEFAULT NULL,
  `OAuthVerifier` varchar(350) DEFAULT NULL,
  `ProfileUrl` varchar(350) DEFAULT NULL,
  `EmailId` varchar(350) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT NULL,
  `Connections` int(10) DEFAULT NULL,
  `LastUpdate` datetime DEFAULT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
  `ProfileImageUrl` varchar(350) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `LinkedinUserId` (`LinkedinUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.linkedincompanypage
CREATE TABLE IF NOT EXISTS `linkedincompanypage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `LinkedinPageId` varchar(350) DEFAULT NULL,
  `LinkedinPageName` varchar(350) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT NULL,
  `EmailDomains` varchar(350) DEFAULT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
  `OAuthToken` varchar(350) DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `OAuthSecret` varchar(350) DEFAULT NULL,
  `OAuthVerifier` varchar(350) DEFAULT NULL,
  `Description` text,
  `FoundedYear` varchar(350) DEFAULT NULL,
  `EndYear` varchar(350) DEFAULT NULL,
  `Locations` varchar(350) DEFAULT NULL,
  `Specialties` varchar(350) DEFAULT NULL,
  `WebsiteUrl` varchar(500) DEFAULT NULL,
  `Status` varchar(350) DEFAULT NULL,
  `EmployeeCountRange` varchar(350) DEFAULT NULL,
  `Industries` varchar(350) DEFAULT NULL,
  `CompanyType` varchar(350) DEFAULT NULL,
  `LogoUrl` varchar(500) DEFAULT NULL,
  `SquareLogoUrl` varchar(500) DEFAULT NULL,
  `BlogRssUrl` varchar(500) DEFAULT NULL,
  `UniversalName` varchar(350) DEFAULT NULL,
  `NumFollowers` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.mongoboards
CREATE TABLE IF NOT EXISTS `mongoboards` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `boardName` varchar(50) NOT NULL,
  `TempboardName` varchar(50) NOT NULL,
  `boardId` varchar(50) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `trendingtype` tinyint(4) NOT NULL,
  `createDate` datetime NOT NULL,
  `isActive` tinyint(4) NOT NULL,
  `facebookHashTag` varchar(50) DEFAULT NULL,
  `twitterHashTag` varchar(50) NOT NULL,
  `instagramHashTag` varchar(50) NOT NULL,
  `gplusHashTag` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.newsletter
CREATE TABLE IF NOT EXISTS `newsletter` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `NewsLetterBody` varchar(1000) NOT NULL,
  `Subject` varchar(250) NOT NULL,
  `ExpiryDate` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) DEFAULT NULL,
  `notificationtime` varchar(50) DEFAULT NULL,
  `MsgId` bigint(20) DEFAULT NULL,
  `MsgStatus` text,
  `ReadOrUnread` text,
  `NotificationType` text,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.package
CREATE TABLE IF NOT EXISTS `package` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `packagename` varchar(50) DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.paymenttransaction
CREATE TABLE IF NOT EXISTS `paymenttransaction` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  `paymentdate` datetime DEFAULT NULL,
  `trasactionId` varchar(50) DEFAULT NULL,
  `paymentId` varchar(50) DEFAULT NULL,
  `PaymentType` tinyint(4) DEFAULT '0',
  `subscrdate` datetime DEFAULT NULL,
  `payeremail` varchar(50) DEFAULT NULL,
  `Payername` varchar(50) DEFAULT NULL,
  `paymentstatus` varchar(50) DEFAULT NULL,
  `itemname` varchar(50) DEFAULT NULL,
  `media` varchar(50) DEFAULT NULL,
  `bluesnapSubscriptions` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=156 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.pinterestaccount
CREATE TABLE IF NOT EXISTS `pinterestaccount` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) NOT NULL,
  `isactive` tinyint(4) NOT NULL,
  `pinscount` bigint(20) NOT NULL,
  `followingcount` bigint(20) NOT NULL,
  `followerscount` bigint(20) NOT NULL,
  `boardscount` bigint(20) NOT NULL,
  `likescount` bigint(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `profileid` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `accounttype` varchar(50) NOT NULL,
  `url` varchar(500) NOT NULL,
  `accesstoken` varchar(500) NOT NULL,
  `profileimgaeurl` varchar(500) NOT NULL,
  `bio` text NOT NULL,
  `lastupdate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.rssfeedurl
CREATE TABLE IF NOT EXISTS `rssfeedurl` (
  `rssFeedUrlId` bigint(20) NOT NULL AUTO_INCREMENT,
  `rssurl` text,
  `LastUpdate` datetime DEFAULT NULL,
  `Keywords` text,
  `ProfileId` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`rssFeedUrlId`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.scheduledmessage
CREATE TABLE IF NOT EXISTS `scheduledmessage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shareMessage` text COLLATE utf8mb4_bin,
  `clientTime` datetime DEFAULT NULL,
  `scheduleTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `status` tinyint(4) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `profileType` tinyint(4) NOT NULL,
  `profileId` varchar(500) COLLATE utf8mb4_bin NOT NULL,
  `picUrl` varchar(5000) COLLATE utf8mb4_bin DEFAULT NULL,
  `socialprofileName` varchar(200) COLLATE utf8mb4_bin DEFAULT NULL,
  `url` varchar(5000) COLLATE utf8mb4_bin DEFAULT NULL,
  `link` varchar(5000) COLLATE utf8mb4_bin DEFAULT NULL,
  `localscheduletime` text COLLATE utf8mb4_bin,
  `calendertime` datetime DEFAULT NULL,
  `mediaType` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=153 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.sessionhistory
CREATE TABLE IF NOT EXISTS `sessionhistory` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `systemId` varchar(50) NOT NULL,
  `ipAddress` varchar(50) NOT NULL,
  `browseros` varchar(50) NOT NULL,
  `lastAccessedTime` datetime NOT NULL,
  `firstloginTime` datetime NOT NULL,
  `sessionStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.training
CREATE TABLE IF NOT EXISTS `training` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL DEFAULT '0',
  `FirstName` varchar(100) CHARACTER SET utf8 NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8 NOT NULL,
  `EmailId` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `Company` varchar(100) DEFAULT NULL,
  `PhoneNo` varchar(100) NOT NULL,
  `Message` varchar(500) DEFAULT NULL,
  `PaymentAmount` varchar(50) NOT NULL,
  `PaymentStatus` varchar(50) DEFAULT NULL,
  `PaymentDate` datetime DEFAULT NULL,
  `CreatedDate` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.twitteraccount
CREATE TABLE IF NOT EXISTS `twitteraccount` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `twitterUserId` varchar(50) NOT NULL,
  `twitterScreenName` varchar(50) NOT NULL,
  `oAuthToken` varchar(5000) NOT NULL,
  `oAuthSecret` varchar(5000) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `followersCount` bigint(20) NOT NULL DEFAULT '0',
  `followingCount` bigint(20) NOT NULL DEFAULT '0',
  `isActive` bit(1) NOT NULL DEFAULT b'0',
  `SchedulerUpdate` datetime DEFAULT NULL,
  `Column 10` bit(1) NOT NULL DEFAULT b'0',
  `profileUrl` varchar(5000) DEFAULT NULL,
  `profileImageUrl` varchar(5000) DEFAULT NULL,
  `twitterName` varchar(500) DEFAULT NULL,
  `isAccessTokenActive` bit(1) NOT NULL DEFAULT b'1',
  `lastUpdate` datetime DEFAULT NULL,
  `profileBackgroundImageUrl` varchar(5000) DEFAULT NULL,
  `location` varchar(5000) DEFAULT NULL,
  `description` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `twitterUserId` (`twitterUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.user
CREATE TABLE IF NOT EXISTS `user` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserName` varchar(350) CHARACTER SET utf8 NOT NULL,
  `EmailId` varchar(350) CHARACTER SET utf8 NOT NULL,
  `ProfilePicUrl` varchar(350) CHARACTER SET utf8 DEFAULT NULL,
  `EmailValidateToken` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ValidateTokenExpireDate` datetime DEFAULT NULL,
  `AccountType` tinyint(10) NOT NULL DEFAULT '0',
  `CreateDate` datetime DEFAULT NULL,
  `ExpiryDate` datetime DEFAULT NULL,
  `Password` varchar(350) CHARACTER SET utf8 DEFAULT NULL,
  `TimeZone` varchar(350) CHARACTER SET utf8 DEFAULT NULL,
  `PaymentStatus` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'default value = unpaid',
  `ActivationStatus` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 = InActive,1 = Active',
  `LastLoginTime` datetime DEFAULT NULL,
  `PhoneNumber` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `LastName` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `FirstName` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `RegistrationType` tinyint(4) NOT NULL DEFAULT '0',
  `Ewallet` varchar(50) COLLATE utf8_unicode_ci DEFAULT '0',
  `dateOfBirth` datetime DEFAULT NULL,
  `aboutMe` varchar(5000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dailyGrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `weeklyGrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `days15GrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `monthlyGrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `days60GrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `days90GrpReportsSummery` bit(1) NOT NULL DEFAULT b'1',
  `otherNewsLetters` bit(1) NOT NULL DEFAULT b'1',
  `forgotPasswordKeyToken` varchar(50) COLLATE utf8_unicode_ci DEFAULT '1',
  `forgotPasswordExpireDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `PayPalAccountStatus` tinyint(4) DEFAULT '0',
  `PaymentType` tinyint(4) DEFAULT '0',
  `TrailStatus` tinyint(4) DEFAULT '0',
  `UserType` varchar(350) COLLATE utf8_unicode_ci DEFAULT NULL,
  `MailstatusforAccountExpiry` datetime(6) DEFAULT NULL,
  `MailstatusbeforeAccountExpire` datetime(6) DEFAULT NULL,
  `lastloginreminder` datetime(6) DEFAULT NULL,
  `Dailymailstatusreport` datetime(6) DEFAULT NULL,
  `mailstatusforweeklyreport` datetime(6) DEFAULT NULL,
  `mailstatusfor15daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor30daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor60daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor90daysreport` datetime(6) DEFAULT NULL,
  `scheduleFailureUpdates` bit(1) DEFAULT b'0',
  `scheduleSuccessUpdates` bit(1) DEFAULT b'0',
  `TwostepEnable` tinyint(4) DEFAULT '1',
  `SocialLoginEnableFb` tinyint(4) DEFAULT '1',
  `SocialLoginEnableGo` tinyint(4) DEFAULT '1',
  `Adsstatus` bit(1) DEFAULT b'0',
  `urlShortnerStatus` tinyint(4) NOT NULL DEFAULT '0',
  `Country` varchar(4) COLLATE utf8_unicode_ci DEFAULT NULL,
  `PhoneCode` varchar(9) COLLATE utf8_unicode_ci DEFAULT NULL,
  `RefrralCode` text COLLATE utf8_unicode_ci,
  `ReferdBy` text COLLATE utf8_unicode_ci,
  `ReferralStatus` text COLLATE utf8_unicode_ci,
  PRIMARY KEY (`Id`),
  FULLTEXT KEY `EmailId` (`EmailId`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.youtubechannel
CREATE TABLE IF NOT EXISTS `youtubechannel` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `YtubeChannelId` varchar(100) DEFAULT NULL,
  `YtubeChannelName` varchar(100) DEFAULT NULL,
  `LastUpdate` datetime DEFAULT NULL,
  `ChannelpicUrl` varchar(450) DEFAULT NULL,
  `WebsiteUrl` varchar(250) DEFAULT NULL,
  `EntryDate` datetime DEFAULT NULL,
  `YtubeChannelDescription` varchar(500) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT NULL,
  `AccessToken` varchar(400) DEFAULT NULL,
  `RefreshToken` varchar(400) DEFAULT NULL,
  `PublishingDate` datetime DEFAULT NULL,
  `VideosCount` double DEFAULT NULL,
  `CommentsCount` double DEFAULT NULL,
  `SubscribersCount` double DEFAULT NULL,
  `ViewsCount` double DEFAULT NULL,
  `Channel_EmailId` varchar(450) DEFAULT NULL,
  `Days90Update` bit(1) DEFAULT NULL,
  `LastReport_Update` datetime DEFAULT NULL,
  `LastVideoListDetails_Update` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table socioboard3.youtubegroups
CREATE TABLE IF NOT EXISTS `youtubegroups` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) DEFAULT NULL,
  `Owner` tinyint(4) DEFAULT NULL,
  `OwnerName` varchar(50) DEFAULT NULL,
  `OwnerEmailid` varchar(50) DEFAULT NULL,
  `Active` tinyint(4) DEFAULT NULL,
  `SBUserName` varchar(50) DEFAULT 'New User',
  `SBEmailId` varchar(50) DEFAULT NULL,
  `SBProfilePic` varchar(400) DEFAULT 'https://i.imgur.com/zqN47Qp.png',
  `AccessSBUserId` bigint(20) DEFAULT NULL,
  `EmailValidationToken` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
