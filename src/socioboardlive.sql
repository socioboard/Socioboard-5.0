-- --------------------------------------------------------
-- Host:                         173.192.35.244
-- Server version:               10.0.25-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             9.3.0.4984
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for socioboardlive
CREATE DATABASE IF NOT EXISTS `socioboardlive` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `socioboardlive`;


-- Dumping structure for table socioboardlive.affiliates
CREATE TABLE IF NOT EXISTS `affiliates` (
  `Id` bigint(20) NOT NULL,
  `UserId` bigint(20) NOT NULL,
  `FriendUserId` bigint(20) NOT NULL,
  `AffiliateDate` datetime NOT NULL,
  `Amount` double DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.demorequest
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.discovery
CREATE TABLE IF NOT EXISTS `discovery` (
  `Network` varchar(350) DEFAULT NULL,
  `SearchKeyword` varchar(3502) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `createTime` datetime DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `GroupId` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.draft
CREATE TABLE IF NOT EXISTS `draft` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shareMessage` varchar(10000) DEFAULT '0',
  `scheduleTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `picUrl` varchar(5000) DEFAULT NULL,
  `GroupId` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.ewalletwithdrawrequest
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


-- Dumping structure for table socioboardlive.facebookaccounts
CREATE TABLE IF NOT EXISTS `facebookaccounts` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `FbUserId` varchar(100) NOT NULL,
  `FbUserName` varchar(100) NOT NULL,
  `AccessToken` varchar(1000) NOT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
  `Friends` bigint(20) NOT NULL,
  `EmailId` varchar(50) DEFAULT NULL,
  `FbProfileType` tinyint(4) NOT NULL,
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
  `PageShareathonUpdate` datetime DEFAULT NULL,
  `GroupShareathonUpdate` datetime DEFAULT NULL,
  `Is90DayDataUpdated` bit(1) DEFAULT NULL,
  `lastpagereportgenerated` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `FbUserId` (`FbUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.googleanalyticsaccount
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.googleplusaccounts
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
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.groupmembers
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
  UNIQUE KEY `userId_groupid_email` (`userId`,`groupid`,`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.groupprofiles
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
  UNIQUE KEY `ProfileId_GroupId` (`ProfileId`,`GroupId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.groups
CREATE TABLE IF NOT EXISTS `groups` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `GroupName` varchar(50) NOT NULL DEFAULT 'Socioboard',
  `CreatedDate` datetime NOT NULL,
  `AdminId` bigint(20) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.instagramaccounts
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.linkedinaccount
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.linkedincompanypage
CREATE TABLE IF NOT EXISTS `linkedincompanypage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `LinkedinPageId` varchar(350) DEFAULT NULL,
  `LinkedinPageName` varchar(350) DEFAULT NULL,
  `IsActive` tinyint(1) DEFAULT NULL,
  `EmailDomains` varchar(350) DEFAULT NULL,
  `OAuthToken` varchar(350) DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `OAuthSecret` varchar(350) DEFAULT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.package
CREATE TABLE IF NOT EXISTS `package` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `packagename` varchar(50) DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.paymenttransaction
CREATE TABLE IF NOT EXISTS `paymenttransaction` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` bigint(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  `paymentdate` datetime DEFAULT NULL,
  `trasactionId` varchar(50) DEFAULT NULL,
  `paymentId` varchar(50) DEFAULT NULL,
  `PaymentType` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.rssfeedurl
CREATE TABLE IF NOT EXISTS `rssfeedurl` (
  `rssFeedUrlId` bigint(20) NOT NULL AUTO_INCREMENT,
  `rssurl` text,
  `LastUpdate` datetime DEFAULT NULL,
  PRIMARY KEY (`rssFeedUrlId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.scheduledmessage
CREATE TABLE IF NOT EXISTS `scheduledmessage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `shareMessage` varchar(10000) DEFAULT '0',
  `clientTime` datetime DEFAULT NULL,
  `scheduleTime` datetime DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  `status` tinyint(4) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `profileType` tinyint(4) NOT NULL,
  `profileId` varchar(500) NOT NULL,
  `picUrl` varchar(5000) DEFAULT NULL,
  `socialprofileName` varchar(200) DEFAULT NULL,
  `url` varchar(5000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scheduleTime` (`scheduleTime`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.training
CREATE TABLE IF NOT EXISTS `training` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL DEFAULT '0',
  `FirstName` varchar(100) CHARACTER SET utf8 NOT NULL,
  `LastName` varchar(100) CHARACTER SET utf8 NOT NULL,
  `Emaild` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `Company` varchar(100) DEFAULT NULL,
  `PhoneNo` varchar(100) NOT NULL,
  `Message` varchar(500) DEFAULT NULL,
  `PaymentAmount` varchar(50) NOT NULL,
  `PaymentStatus` varchar(50) DEFAULT NULL,
  `PaymentDate` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.twitteraccount
CREATE TABLE IF NOT EXISTS `twitteraccount` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `twitterUserId` varchar(50) NOT NULL,
  `twitterScreenName` varchar(50) NOT NULL,
  `oAuthToken` varchar(5000) NOT NULL,
  `oAuthSecret` varchar(5000) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `SchedulerUpdate` datetime DEFAULT NULL,
  `followersCount` bigint(20) NOT NULL DEFAULT '0',
  `followingCount` bigint(20) NOT NULL DEFAULT '0',
  `isActive` bit(1) NOT NULL DEFAULT b'0',
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
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.


-- Dumping structure for table socioboardlive.user
CREATE TABLE IF NOT EXISTS `user` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserName` varchar(350) CHARACTER SET utf8 NOT NULL,
  `EmailId` varchar(250) CHARACTER SET utf8 NOT NULL,
  `ProfilePicUrl` varchar(350) CHARACTER SET utf8 DEFAULT NULL,
  `EmailValidateToken` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ValidateTokenExpireDate` datetime DEFAULT NULL,
  `AccountType` tinyint(4) NOT NULL DEFAULT '0',
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
  `TrailStatus` tinyint(4) DEFAULT '0',
  `PayPalAccountStatus` tinyint(4) DEFAULT '0',
  `PaymentType` tinyint(4) DEFAULT '0',
  `UserType` varchar(350) COLLATE utf8_unicode_ci DEFAULT NULL,
  `MailstatusforAccountExpiry` datetime(6) DEFAULT NULL,
  `MailstatusbeforeAccountExpire` datetime(6) DEFAULT NULL,
  `lastloginreminder` datetime(6) DEFAULT NULL,
  `mailstatusforweeklyreport` datetime(6) DEFAULT NULL,
  `mailstatusfor15daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor30daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor60daysreport` datetime(6) DEFAULT NULL,
  `mailstatusfor90daysreport` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `EmailId` (`EmailId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
