const express = require("express");
const axios = require("axios");
const _ = require("lodash");

const app = express();
const port = 3000; // Change as needed

// Middleware to retrieve and analyze blog data
app.get("/api/blog-stats", async (req, res) => {
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
    const totalBlogs = blogData.length;
    const longestBlog = _.maxBy(blogData, "title.length");
    const blogsWithPrivacy = _.filter(blogData, (blog) =>
      _.includes(blog.title.toLowerCase(), "privacy")
    );
    const uniqueBlogTitles = _.uniqBy(blogData, "title");

    // Create a JSON response
    const blogStatistics = {
      totalBlogs,
      longestBlog: longestBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    res.json(blogStatistics);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Blog search endpoint
app.get("/api/blog-search", (req, res) => {
  const query = req.query.query.toLowerCase();
  if (!query) {
    res.status(400).json({ error: "Query parameter missing" });
    return;
  }

  const filteredBlogs = _.filter(blogData, (blog) =>
    blog.title.toLowerCase().includes(query)
  );

  res.json(filteredBlogs);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
