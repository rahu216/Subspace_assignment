const express = require("express");
const axios = require("axios");
const _ = require("lodash");
require("dotenv").config();
const port = process.env.PORT || 3000;
const app = express();

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Middleware to retrieve and analyze blog data
app.get("/api/blog-stats", async (req, res, next) => {
  try {
    const response = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    const blogData = response.data;

    // Calculate statistics
    const totalBlogs = blogData.blogs.length;
    const longestBlog = _.maxBy(blogData.blogs, "title.length");
    const blogsWithPrivacy = _.filter(
      blogData.blogs,
      (blog) => blog.title && blog.title.toLowerCase().includes("privacy")
    );
    const uniqueBlogTitles = _.uniqBy(blogData.blogs, "title");

    // Create a JSON response
    const blogStatistics = {
      totalBlogs,
      longestBlog: longestBlog ? longestBlog.title : "N/A",
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    res.json(blogStatistics);
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
});

// Blog search endpoint
app.get("/api/blog-search", async (req, res, next) => {
  const query = req.query.query;
  if (!query) {
    res.status(400).json({ error: "Query parameter missing" });
    return;
  }

  try {
    const response = await axios.get(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      {
        headers: {
          "x-hasura-admin-secret":
            "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6",
        },
      }
    );

    const blogData = response.data;

    // Filter blogs based on the query (case-insensitive)
    const filteredBlogs = blogData.blogs.filter(
      (blog) =>
        blog.title && blog.title.toLowerCase().includes(query.toLowerCase())
    );

    res.json(filteredBlogs);
  } catch (error) {
    // Pass the error to the error handling middleware
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
