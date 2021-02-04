-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Server version: 10.3.21-MariaDB
-- PHP Version: 7.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `snackbox`
--

CREATE DATABASE snackbox;

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE snackbox.comment (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `recipe_id` binary(16) NOT NULL,
  `text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `recipe`
--

CREATE TABLE snackbox.recipe (
  `id` binary(16) NOT NULL,
  `title` text NOT NULL,
  `cookingtime` int(11) NOT NULL,
  `servingsize` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `ingredients` text NOT NULL,
  `preparation` text NOT NULL,
  `imageurl` text NOT NULL,
  `user_id` binary(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `user`
--

CREATE TABLE snackbox.user (
  `id` binary(16) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` text DEFAULT NULL,
  `phonenumber` text DEFAULT NULL,
  `isadmin` int(1) NOT NULL,
  `email` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for table `comment`
--
ALTER TABLE snackbox.comment
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_recipe_id` (`recipe_id`);

--
-- Indexes for table `recipe`
--
ALTER TABLE snackbox.recipe
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `user`
--
ALTER TABLE snackbox.user
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comment`
--
ALTER TABLE snackbox.comment
  ADD CONSTRAINT `FK_RecipeComment` FOREIGN KEY (`recipe_id`) REFERENCES `recipe` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_UserComment` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recipe`
--
ALTER TABLE snackbox.recipe
  ADD CONSTRAINT `FK_UserRecipe` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;