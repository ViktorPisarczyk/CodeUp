import AsideMenu from "../components/AsideMenu";
import { useState } from "react";
import { useNavigate, Route, Routes } from "react-router-dom";

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
    username: "johndoe",
    content:
      "Working on a new open source project. Anyone interested in contributing?",
    likes: 28,
    comments: [],
  },
];

function Profile() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState("");

  const navigate = useNavigate();

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
    <div className="flex flex-row bg-(--primary)">
      <AsideMenu />
      <div className="flex flex-col m-auto w-screen ">
        <div className="flex flex-row relative justify-center   rounded-xl p-5 m-20 bg-(--secondary)">
          <div className="flex w-full  items-center space-y-6">
            <div>
              <img
                className="rounded-full h-50"
                src="https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                alt="avatar"
              />
            </div>
            <div className="m-auto">
              <h2 className="text-3xl mb-5">John Doe</h2>
              <h4>Berlin</h4>
              <h4>Employer by DCI</h4>
            </div>
            <div className="w-100">
              <h4>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Assumenda omnis ducimus voluptatem
              </h4>
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="hover:bg-(--primary) absolute bottom-3 right-3 rounded-md"
            >
              Edit Profile
            </button>
          </div>
        </div>
        <div className="divide-y-1 w-max-screen m-auto ">
          <div className="mt-10 mb-6 h-25 ">
            <h1 className="text-3xl font-bold">Posts</h1>
            <button className=" mt-5 hover:bg-(--secondary) rounded-md ">
              Create Post
            </button>
          </div>
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
                      <button>🩶</button>
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
    </div>
  );
}
export default Profile;
