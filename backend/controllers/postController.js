const imageService = require("../services/imageService");

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANOKEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const postController = {
  // Tạo hoặc cập nhật bài đăng
  async createOrUpdatePost(req, res) {
    try {
      const post = req.body;
      console.log("Post data received:", post);

      // Xử lý file nếu có
      if (post.file && typeof post.file == "object") {
        let isImage = post?.file?.type == "image";
        let folderName = isImage ? "postImages" : "postVideos";
        let fileResult = await imageService.uploadFile(
          folderName,
          post?.file?.uri,
          isImage
        );
        if (fileResult.success) post.file = fileResult.data;
        else {
          return res.status(400).json({
            success: false,
            msg: "Could not upload file",
            error: fileResult,
          });
        }
      }

      console.log("Post data being sent:", post);

      const { data, error } = await supabase
        .from("posts")
        .upsert(post)
        .select()
        .single();

      if (error) {
        console.log("createPost error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not create your post",
          error,
        });
      }

      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log("createPost error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not create your post",
        error: error.message,
      });
    }
  },

  // Lấy danh sách bài đăng
  async getPosts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.query.userId;

      let query = supabase
        .from("posts")
        .select(
          `
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (count)
      `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      // Nếu có userId, lọc theo userId
      if (userId) {
        query = query.eq("userId", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.log("fetchPosts error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not fetch posts",
          error,
        });
      }

      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log("fetchPosts error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not fetch posts",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết bài đăng
  async getPostDetails(req, res) {
    try {
      const postId = req.params.postId;

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (*, user: users (id, name, image))
      `
        )
        .eq("id", postId)
        .order("created_at", { ascending: false, foreignTable: "comments" })
        .single();

      if (error) {
        console.log("fetchPostsDetails error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not fetch post details",
          error,
        });
      }

      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log("fetchPostsDetails error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not fetch post details",
        error: error.message,
      });
    }
  },

  // Thêm like vào bài đăng
  async likePost(req, res) {
    try {
      const postLike = req.body;

      const { data, error } = await supabase
        .from("postLikes")
        .insert(postLike)
        .select()
        .single();

      if (error) {
        console.log("postLike error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not like the post",
          error,
        });
      }

      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log("postLike error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not like the post",
        error: error.message,
      });
    }
  },

  // Xóa like khỏi bài đăng
  async unlikePost(req, res) {
    try {
      const { postId, userId } = req.params;

      const { error } = await supabase
        .from("postLikes")
        .delete()
        .eq("userId", userId)
        .eq("postId", postId);

      if (error) {
        console.log("postLike error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not remove the post like",
          error,
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.log("postLike error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not remove the post like",
        error: error.message,
      });
    }
  },

  // Thêm bình luận vào bài đăng
  async addComment(req, res) {
    try {
      const comment = req.body;

      const { data, error } = await supabase
        .from("comments")
        .insert(comment)
        .select()
        .single();

      if (error) {
        console.log("comment error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not create your comment",
          error,
        });
      }

      return res.status(200).json({ success: true, data: data });
    } catch (error) {
      console.log("comment error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not create your comment",
        error: error.message,
      });
    }
  },

  // Xóa bình luận
  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.log("removeComment error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not remove the comment",
          error,
        });
      }

      return res.status(200).json({ success: true, data: { commentId } });
    } catch (error) {
      console.log("removeComment error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not remove the comment",
        error: error.message,
      });
    }
  },

  // Xóa bài đăng
  async deletePost(req, res) {
    try {
      const { postId } = req.params;

      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) {
        console.log("removePost error: ", error);
        return res.status(400).json({
          success: false,
          msg: "Could not remove the post",
          error,
        });
      }

      return res.status(200).json({ success: true, data: { postId } });
    } catch (error) {
      console.log("removePost error: ", error);
      return res.status(500).json({
        success: false,
        msg: "Could not remove the post",
        error: error.message,
      });
    }
  },
};

module.exports = postController;