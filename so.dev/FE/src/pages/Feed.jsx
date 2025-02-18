import { useState } from "react";
import AsideMenu from "../components/AsideMenu";
import Toggle from "../components/Toggle";
// Temporary mock data
const initialPosts = [
  {
    id: 1,
    username: "johndoe",
    content: "Just deployed my first React app! 🚀",
    image: "https://placehold.co/600x400",
    likes: 42,
    comments: [{ id: 1, username: "jane", content: "Awesome work!" }],
  },
  {
    id: 2,
    username: "jane_dev",
    content:
      "Working on a new open source project. Anyone interested in contributing?",
    likes: 28,
    comments: [],
  },
];

export default function Feed() {
  // const Post = ({ postId, initialLikes }) => {

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0); //(initialLikes);

  const handleLike = () => {
    //async
    setLiked(!liked);

    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }

    // try {
    //   const response = await fetch(
    //     `http://localhost:5000/posts/like`, //${postId}/like`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({ liked: !liked }),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error("Failed to update like status");
    //   }

    //   const data = await response.json();
    //   setLikesCount(data.likes);
    // } catch (error) {
    //   console.error("Error while updating like status:", error);
    // }

    // setLiked(liked);
    // setLikesCount(likesCount);
  };
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState("");

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: posts.length + 1,
      username: "currentUser",
      content: newPost,
      likes: 0,
      comments: [],
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="flex flex-row divide-x divide-(--primary)min-h-screen bg-(--primary)">
      <AsideMenu />
      
      <div className="max-w-2xl mx-auto pt-8 px-4">
        {/* Create Post */}
        <form
          onSubmit={handlePostSubmit}
          className="bg-(--secondary) rounded-lg p-4 mb-6 shadow-md"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400  bg-(--tertiary)"
            rows="3"
          />
          <div className="mt-2 flex justify-between items-center">
            <button type="button" className=" hover:text-(--primary) ">
              📷 Add Photo
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-(--tertiary)  rounded-md hover:bg-(--primary) "
            >
              Post
            </button>
          </div>
        </form>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-(--secondary)  rounded-lg shadow-md"
            >
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-400 dark:bg-purple-500 flex items-center justify-center text-white">
                    {post.username[0].toUpperCase()}
                  </div>
                  <span className="ml-2 font-medium ">{post.username}</span>
                </div>
                <p className="">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="rounded-md w-full mb-4"
                  />
                )}
                <div className="flex items-center space-x-4 ">
                  <button className="flex items-center space-x-1">
                    <button onClick={handleLike}>
                      {liked ? "🩶" : "❤️"} ({likesCount})
                    </button>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{post.comments.length}</span>
                  </button>
                </div>
              </div>
              {post.comments.length > 0 && (
                <div className="border-t border-gray-200 dark:border-purple-700 p-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="text-sm ">
                      <span className="font-medium">{comment.username}:</span>{" "}
                      {comment.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
