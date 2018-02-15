CREATE DATABASE  IF NOT EXISTS `uefivt` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `uefivt`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: uefivt
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analysis`
--

DROP TABLE IF EXISTS `analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `analysis` (
  `analysisID` int(11) NOT NULL AUTO_INCREMENT,
  `analysisName` varchar(45) NOT NULL,
  `analysisReport` longtext NOT NULL,
  `analysisUploadID` int(11) NOT NULL,
  PRIMARY KEY (`analysisID`),
  KEY `fk_analysis_uploadID_idx` (`analysisUploadID`),
  CONSTRAINT `fk_analysis_uploadID` FOREIGN KEY (`analysisUploadID`) REFERENCES `upload` (`uploadID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `module` (
  `moduleID` int(11) NOT NULL AUTO_INCREMENT,
  `moduleName` varchar(45) NOT NULL,
  `moduleGUID` varchar(36) NOT NULL,
  `moduleMD5` varchar(32) NOT NULL,
  `moduleSHA1` varchar(40) NOT NULL,
  `moduleSHA256` varchar(64) NOT NULL,
  `moduleUploadID` int(11) NOT NULL,
  PRIMARY KEY (`moduleID`),
  UNIQUE KEY `ix_module` (`moduleName`,`moduleGUID`,`moduleMD5`,`moduleSHA1`,`moduleSHA256`,`moduleUploadID`),
  KEY `fk_module_uploadID_idx` (`moduleUploadID`),
  CONSTRAINT `fk_module_uploadID` FOREIGN KEY (`moduleUploadID`) REFERENCES `upload` (`uploadID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `upload`
--

DROP TABLE IF EXISTS `upload`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `upload` (
  `uploadID` int(11) NOT NULL AUTO_INCREMENT,
  `uploadName` varchar(45) NOT NULL,
  `uploadDate` datetime NOT NULL,
  `uploadChecksum` varchar(45) NOT NULL,
  PRIMARY KEY (`uploadID`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-02-12 15:06:57
